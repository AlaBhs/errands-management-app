using ErrandsManagement.Application.Auth.Commands.LoginUser;
using ErrandsManagement.Application.Auth.Commands.Logout;
using ErrandsManagement.Application.Auth.Commands.RefreshToken;
using ErrandsManagement.Application.Auth.Commands.RegisterUser;
using ErrandsManagement.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _mediator;

    public AuthController(ISender mediator) => _mediator = mediator;

    /// <summary>Register a new Collaborator or Courier account.</summary>
    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Authenticate with email and password, receive token pair.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginUserCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Exchange a valid refresh token for a new access + refresh token pair.</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Refresh(
        [FromBody] RefreshTokenCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    /// <summary>Revoke the current refresh token, ending the session.</summary>
    [HttpPost("logout")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Logout(
        [FromBody] LogoutCommand command,
        CancellationToken ct)
    {
        await _mediator.Send(command, ct);
        return NoContent();
    }

    [HttpPost("debug/check-token")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckToken(
    [FromBody] RefreshTokenCommand command,
    [FromServices] AppDbContext db)
    {
        var tokenInDb = await db.RefreshTokens
            .Where(t => t.Token == command.Token)
            .Select(t => new
            {
                t.Token,
                t.Revoked,
                t.ExpiresAt,
                t.UserId,
                t.CreatedAt,
                IsActive = !t.Revoked && t.ExpiresAt > DateTime.UtcNow
            })
            .FirstOrDefaultAsync();

        var allTokens = await db.RefreshTokens
            .Select(t => new
            {
                TokenPreview = t.Token.Substring(0, 10) + "...",
                t.Revoked,
                t.ExpiresAt,
                t.UserId
            })
            .ToListAsync();

        return Ok(new
        {
            searched = command.Token.Substring(0, 10) + "...",
            exactMatch = tokenInDb,
            allTokens
        });
    }
}