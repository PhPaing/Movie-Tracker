using System.Security.Claims;
using MovieTracker.Api.Data;
using MovieTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace MovieTracker.Api.Controllers;

[ApiController, Authorize, Route("api/mylist")]
public class MyListController(AppDb db) : ControllerBase
{
    private static readonly string[] Statuses = ["WantToWatch", "Watching", "Watched"];
    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public Task<List<MyListItem>> Get(string? status) =>
        db.UserMovies.AsNoTracking()
          .Where(u => u.UserId == UserId && (status == null || u.Status == status))
          .OrderByDescending(u => u.UpdatedAt)
          .Select(u => new MyListItem(u.MovieId, u.Movie.Title, u.Movie.Genre,
                                      u.Movie.PosterUrl, u.Status, u.Rating, u.Notes))
          .ToListAsync();

    [HttpGet("{movieId:int}")]
    public async Task<ActionResult<EntryDto>> GetOne(int movieId)
    {
        var e = await db.UserMovies.AsNoTracking()
            .FirstOrDefaultAsync(u => u.UserId == UserId && u.MovieId == movieId);
        return e is null ? NoContent() : new EntryDto(e.Status, e.Rating, e.Notes);
    }

    [HttpPut("{movieId:int}")]
    public async Task<IActionResult> Save(int movieId, SaveEntryRequest req)
    {
        if (!Statuses.Contains(req.Status)) return BadRequest(new { message = "Invalid status." });
        if (!await db.Movies.AnyAsync(b => b.Id == movieId)) return NotFound();

        var e = await db.UserMovies.FirstOrDefaultAsync(u => u.UserId == UserId && u.MovieId == movieId);
        if (e is null) db.UserMovies.Add(e = new UserMovie { UserId = UserId, MovieId = movieId });
        e.Status = req.Status;
        e.Rating = req.Rating;
        e.Notes = req.Notes;
        e.UpdatedAt = DateTime.UtcNow;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{movieId:int}")]
    public async Task<IActionResult> Delete(int movieId)
    {
        var e = await db.UserMovies.FirstOrDefaultAsync(u => u.UserId == UserId && u.MovieId == movieId);
        if (e is null) return NotFound();
        db.UserMovies.Remove(e);
        await db.SaveChangesAsync();
        return NoContent();
    }
}
