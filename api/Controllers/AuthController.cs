using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using MovieTracker.Api.Data;
using MovieTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
namespace MovieTracker.Api.Controllers;

[ApiController, Route("api/auth")]
public class AuthController(AppDb db, IConfiguration cfg) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(AuthRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        if (await db.Users.AnyAsync(u => u.Email == email))
            return Conflict(new { message = "Email already registered." });
        var user = new User { Email = email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password) };
        db.Users.Add(user);
        await db.SaveChangesAsync();
        return Ok(CreateToken(user));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(AuthRequest req)
    {
        var email = req.Email.Trim().ToLowerInvariant();
        var user = await db.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user is null || !BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password." });
        return Ok(CreateToken(user));
    }

    private AuthResponse CreateToken(User u)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(cfg["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            issuer: cfg["Jwt:Issuer"],
            claims: [new Claim(ClaimTypes.NameIdentifier, u.Id.ToString()), new Claim(ClaimTypes.Email, u.Email)],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));
        return new AuthResponse(u.Email, new JwtSecurityTokenHandler().WriteToken(token));
    }
}
