using System.Text.Json.Serialization;
using MovieTracker.Api.Data;
using MovieTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace MovieTracker.Api.Services;

/// Background service: imports movies from TMDB on startup, then every N hours (upsert by TmdbId).
public class TmdbImporter(IServiceScopeFactory scopes, IHttpClientFactory http,
    IConfiguration cfg, ILogger<TmdbImporter> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        while (!ct.IsCancellationRequested)
        {
            try { await ImportAsync(ct); }
            catch (Exception ex) when (ex is not OperationCanceledException) { log.LogError(ex, "Import failed"); }
            await Task.Delay(TimeSpan.FromHours(cfg.GetValue("Import:IntervalHours", 24)), ct);
        }
    }

    private async Task ImportAsync(CancellationToken ct)
    {
        var key = cfg["Tmdb:ApiKey"];
        if (string.IsNullOrWhiteSpace(key))
        {
            log.LogWarning("Tmdb:ApiKey is not set - skipping import. See README.");
            return;
        }

        var client = http.CreateClient("tmdb");
        var genreList = await client.GetFromJsonAsync<GenreList>($"genre/movie/list?api_key={key}", ct);
        var genres = genreList?.Genres.ToDictionary(g => g.Id, g => g.Name) ?? [];
        var lists = cfg.GetSection("Import:Lists").Get<string[]>() ?? ["popular", "top_rated"];
        var pages = cfg.GetValue("Import:Pages", 10);

        using var scope = scopes.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDb>();

        foreach (var list in lists)
        {
            var added = 0;
            for (var page = 1; page <= pages; page++)
            {
                var res = await client.GetFromJsonAsync<MovieList>($"movie/{list}?api_key={key}&language=en-US&page={page}", ct);
                var results = res?.Results?.GroupBy(r => r.Id).Select(g => g.First()).ToList() ?? [];
                var ids = results.Select(r => r.Id).ToList();
                var existing = await db.Movies.Where(m => ids.Contains(m.TmdbId)).ToDictionaryAsync(m => m.TmdbId, ct);

                foreach (var r in results)
                {
                    if (existing.TryGetValue(r.Id, out var m)) { m.VoteAverage = r.VoteAverage; continue; } // refresh rating
                    db.Movies.Add(new Movie
                    {
                        TmdbId = r.Id,
                        Title = r.Title,
                        Overview = r.Overview,
                        Genre = r.GenreIds?.FirstOrDefault() is int gid && genres.TryGetValue(gid, out var name) ? name : "Other",
                        Year = r.ReleaseDate is { Length: >= 4 } d && int.TryParse(d[..4], out var y) ? y : null,
                        PosterUrl = r.PosterPath is null ? null : $"https://image.tmdb.org/t/p/w342{r.PosterPath}",
                        VoteAverage = r.VoteAverage
                    });
                    added++;
                }
                await db.SaveChangesAsync(ct);
            }
            log.LogInformation("Imported {Count} new movies from '{List}'", added, list);
        }
    }

    private record GenreItem(int Id, string Name);
    private record GenreList(List<GenreItem> Genres);
    private record MovieList(List<Result>? Results);
    private record Result(int Id, string Title, string? Overview,
        [property: JsonPropertyName("poster_path")] string? PosterPath,
        [property: JsonPropertyName("release_date")] string? ReleaseDate,
        [property: JsonPropertyName("vote_average")] double VoteAverage,
        [property: JsonPropertyName("genre_ids")] List<int>? GenreIds);
}
