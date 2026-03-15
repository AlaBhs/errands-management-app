using ErrandsManagement.Application.Auth.Commands.LoginUser;
using ErrandsManagement.Application.Auth.Commands.Logout;
using ErrandsManagement.Application.Auth.Commands.RefreshToken;
using ErrandsManagement.Application.Auth.Commands.RegisterUser;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly ISender _mediator;
    private const string RefreshTokenCookie = "refresh_token";

    public AuthController(ISender mediator) => _mediator = mediator;

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register(
        [FromBody] RegisterUserCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        return Ok(result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(
        [FromBody] LoginUserCommand command,
        CancellationToken ct)
    {
        var result = await _mediator.Send(command, ct);
        SetRefreshTokenCookie(result.RefreshToken);
        return Ok(new
        {
            result.AccessToken,
            result.ExpiresAt,
            result.Email,
            result.FullName,
            result.Roles
        });
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(CancellationToken ct)
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie];

        if (string.IsNullOrWhiteSpace(refreshToken))
            return Unauthorized("Refresh token cookie missing.");

        var result = await _mediator.Send(new RefreshTokenCommand(refreshToken), ct);
        SetRefreshTokenCookie(result.RefreshToken);

        return Ok(new
        {
            result.AccessToken,
            result.ExpiresAt,
            result.Email,
            result.FullName,
            result.Roles
        });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        var refreshToken = Request.Cookies[RefreshTokenCookie];

        if (!string.IsNullOrWhiteSpace(refreshToken))
            await _mediator.Send(new LogoutCommand(refreshToken), ct);

        Response.Cookies.Delete(RefreshTokenCookie, new CookieOptions
        {
            Path = "/"
        });

        return NoContent();
    }

    private void SetRefreshTokenCookie(string token)
    {
        Response.Cookies.Append(RefreshTokenCookie, token, new CookieOptions
        {
            HttpOnly = true,
            Secure = false,
            SameSite = SameSiteMode.Lax,
            Expires = DateTimeOffset.UtcNow.AddDays(7),
            Path = "/"
        });
    }
}