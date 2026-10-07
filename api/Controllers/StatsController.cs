using System.Security.Claims;
using MovieTracker.Api.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
namespace MovieTracker.Api.Controllers;

[ApiController, Authorize, Route("api/stats")]
public class StatsController(AppDb db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var uid = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var entries = db.UserMovies.AsNoTracking().Where(u => u.UserId == uid);

        var total = await entries.CountAsync();
        var avg = await entries.AverageAsync(u => (double?)u.Rating);
        var byStatus = await entries.GroupBy(u => u.Status)
            .Select(g => new { status = g.Key, count = g.Count() }).ToListAsync();
        var topGenres = await entries.GroupBy(u => u.Movie.Genre)
            .Select(g => new { genre = g.Key, count = g.Count(), avgRating = g.Average(x => (double?)x.Rating) })
            .OrderByDescending(x => x.count).Take(8).ToListAsync();

        return Ok(new { total, averageRating = avg, byStatus, topGenres });
    }
}
