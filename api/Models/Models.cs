namespace MovieTracker.Api.Models;

public class Movie
{
    public int Id { get; set; }
    public int TmdbId { get; set; }                // The Movie Database id
    public string Title { get; set; } = "";
    public string? Overview { get; set; }
    public string Genre { get; set; } = "";         // primary genre
    public int? Year { get; set; }
    public string? PosterUrl { get; set; }
    public double VoteAverage { get; set; }         // TMDB community rating (0-10)
}

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public List<UserMovie> Movies { get; set; } = [];
}

public class UserMovie
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int MovieId { get; set; }
    public string Status { get; set; } = "WantToWatch"; // WantToWatch | Watching | Watched
    public int? Rating { get; set; }                    // my rating 1-5
    public string? Notes { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public User User { get; set; } = null!;
    public Movie Movie { get; set; } = null!;
}
