using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.UserPreferences.Commands.UpdateCollaboratorDefaults;
using ErrandsManagement.Application.UserPreferences.Commands.UpdateCourierDefaults;
using ErrandsManagement.Application.UserPreferences.Commands.UpdateGeneralPreferences;
using ErrandsManagement.Application.UserPreferences.Commands.UpdateNotificationPreferences;
using ErrandsManagement.Application.UserPreferences.DTOs;
using ErrandsManagement.Application.UserPreferences.Queries.GetMyPreferences;
using ErrandsManagement.Domain.Enums;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/me/preferences")]
[Authorize]
public sealed class UserPreferencesController : ControllerBase
{
    private readonly ISender _mediator;

    public UserPreferencesController(ISender mediator)
    {
        _mediator = mediator;
    }

    private Guid CurrentUserId => Guid.Parse(
        User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException());

    // ── GET /api/me/preferences ───────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetMyPreferencesQuery(CurrentUserId), ct);
        return Ok(ApiResponse<UserPreferencesDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/me/preferences ───────────────────────────────────────────
    [HttpPut]
    public async Task<IActionResult> UpdateGeneral(
        [FromBody] UpdatePreferencesRequest body, CancellationToken ct)
    {
        var userId = CurrentUserId;

        await _mediator.Send(new UpdateGeneralPreferencesCommand(
            userId, body.Language, body.Theme, body.DefaultView), ct);

        await _mediator.Send(new UpdateNotificationPreferencesCommand(
            userId, body.DisabledNotificationTypes ?? []), ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/me/preferences/collaborator ──────────────────────────────
    [HttpPut("collaborator")]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> UpdateCollaborator(
        [FromBody] UpdateCollaboratorDefaultsCommand body, CancellationToken ct)
    {
        await _mediator.Send(body with { UserId = CurrentUserId }, ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/me/preferences/courier ───────────────────────────────────
    [HttpPut("courier")]
    [Authorize(Roles = "Courier")]
    public async Task<IActionResult> UpdateCourier(
        [FromBody] UpdateCourierDefaultsCommand body, CancellationToken ct)
    {
        await _mediator.Send(body with { UserId = CurrentUserId }, ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }
}

// ── Request body record ───────────────────────────────────────────────────

public sealed record UpdatePreferencesRequest(
    string? Language,
    string? Theme,
    string? DefaultView,
    HashSet<NotificationType>? DisabledNotificationTypes);