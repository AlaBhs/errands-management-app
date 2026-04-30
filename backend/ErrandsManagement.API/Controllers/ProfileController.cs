using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Users.Commands.ChangePassword;
using ErrandsManagement.Application.Users.Commands.UpdateProfile;
using ErrandsManagement.Application.Users.Commands.UploadProfilePhoto;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetCurrentUserProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public sealed class ProfileController : ControllerBase
{
    private readonly ISender _mediator;

    public ProfileController(ISender mediator) => _mediator = mediator;

    /// <summary>GET /api/profile — returns the authenticated user's profile.</summary>
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _mediator.Send(
            new GetCurrentUserProfileQuery(GetCurrentUserId()), ct);

        return Ok(ApiResponse<ProfileDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    /// <summary>PUT /api/profile — updates FullName.</summary>
    [HttpPut]
    public async Task<IActionResult> Update(
        [FromBody] UpdateProfileRequest body, CancellationToken ct)
    {
        await _mediator.Send(
            new UpdateProfileCommand(GetCurrentUserId(), body.FullName), ct);

        return NoContent();
    }

    /// <summary>POST /api/profile/change-password</summary>
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword(
        [FromBody] ChangePasswordRequest body, CancellationToken ct)
    {
        // UserId always comes from the JWT — the body never supplies it
        await _mediator.Send(new ChangePasswordCommand(
            GetCurrentUserId(),
            body.CurrentPassword,
            body.NewPassword,
            body.ConfirmPassword), ct);

        return NoContent();
    }

    /// <summary>POST /api/profile/upload-photo — max 5 MB.</summary>
    [HttpPost("upload-photo")]
    [RequestSizeLimit(5 * 1024 * 1024)]
    public async Task<IActionResult> UploadPhoto(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
            return BadRequest("No file provided.");

        await using var stream = file.OpenReadStream();

        var url = await _mediator.Send(new UploadProfilePhotoCommand(
            GetCurrentUserId(),
            stream,
            file.FileName,
            file.ContentType), ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            new { photoUrl = url },
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User identity not found in token.");
        return Guid.Parse(value);
    }
}

// ── Request body records (defined here to keep the controller file self-contained) ──

public sealed record UpdateProfileRequest(string FullName);

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword);