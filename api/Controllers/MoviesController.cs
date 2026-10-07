using MovieTracker.Api.Data;
using MovieTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace MovieTracker.Api.Controllers;

[ApiController, Route("api/movies")]
public class MoviesController(AppDb db) : ControllerBase
{
    [HttpGet]
    public async Task<PagedResult<Movie>> Get(string? search, string? genre, string sort = "rating", int page = 1, int pageSize = 24)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);
        var q = db.Movies.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search)) q = q.Where(m => m.Title.Contains(search));
        if (!string.IsNullOrWhiteSpace(genre)) q = q.Where(m => m.Genre == genre);
        q = sort switch
        {
            "year" => q.OrderByDescending(m => m.Year),
            "title" => q.OrderBy(m => m.Title),
            _ => q.OrderByDescending(m => m.VoteAverage)
        };
        var total = await q.CountAsync();
        var items = await q.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        return new PagedResult<Movie>(items, total, page, pageSize);
    }

    [HttpGet("genres")]
    public Task<List<string>> Genres() =>
        db.Movies.Select(m => m.Genre).Distinct().OrderBy(g => g).ToListAsync();

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Movie>> GetById(int id)
    {
        var movie = await db.Movies.AsNoTracking().FirstOrDefaultAsync(m => m.Id == id);
        return movie is null ? NotFound() : movie;
    }
}
