using MovieTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
namespace MovieTracker.Api.Data;

public class AppDb(DbContextOptions<AppDb> options) : DbContext(options)
{
    public DbSet<Movie> Movies => Set<Movie>();
    public DbSet<User> Users => Set<User>();
    public DbSet<UserMovie> UserMovies => Set<UserMovie>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Movie>(e =>
        {
            e.HasIndex(x => x.TmdbId).IsUnique();
            e.HasIndex(x => x.Genre);
            e.Property(x => x.Title).HasMaxLength(500);
            e.Property(x => x.Genre).HasMaxLength(100);
        });
        b.Entity<User>(e =>
        {
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Email).HasMaxLength(256);
        });
        b.Entity<UserMovie>(e =>
        {
            e.HasIndex(x => new { x.UserId, x.MovieId }).IsUnique();
            e.Property(x => x.Status).HasMaxLength(20);
            e.Property(x => x.Notes).HasMaxLength(2000);
        });
    }
}
