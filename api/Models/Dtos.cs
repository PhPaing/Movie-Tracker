using System.ComponentModel.DataAnnotations;
namespace MovieTracker.Api.Models;

public class AuthRequest
{
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required, MinLength(6)] public string Password { get; set; } = "";
}
public record AuthResponse(string Email, string Token);

public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);

public class SaveEntryRequest
{
    [Required] public string Status { get; set; } = "WantToWatch";
    [Range(1, 5)] public int? Rating { get; set; }
    [MaxLength(2000)] public string? Notes { get; set; }
}
public record MyListItem(int MovieId, string Title, string Genre, string? PosterUrl, string Status, int? Rating, string? Notes);
public record EntryDto(string Status, int? Rating, string? Notes);
