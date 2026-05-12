
using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.SystemConfiguration.Commands.UpdateExpensePolicy;
using ErrandsManagement.Application.SystemConfiguration.Commands.UpdateNotificationPolicy;
using ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRecommendationPolicy;
using ErrandsManagement.Application.SystemConfiguration.Commands.UpdateRequestPolicy;
using ErrandsManagement.Application.SystemConfiguration.Commands.UpdateSlaPolicy;
using ErrandsManagement.Application.SystemConfiguration.DTOs;
using ErrandsManagement.Application.SystemConfiguration.Queries.GetConfigurationChangeLog;
using ErrandsManagement.Application.SystemConfiguration.Queries.GetPublicConfig;
using ErrandsManagement.Application.SystemConfiguration.Queries.GetSystemConfiguration;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/system-config")]
[Authorize(Roles = "Admin")]
public sealed class SystemConfigurationController : ControllerBase
{
    private readonly ISender _mediator;

    public SystemConfigurationController(ISender mediator)
    {
        _mediator = mediator;
    }

    // ── GET /api/system-config ────────────────────────────────────────────
    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetSystemConfigurationQuery(), ct);
        return Ok(ApiResponse<SystemConfigurationDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/system-config/recommendation ─────────────────────────────
    [HttpPut("recommendation")]
    public async Task<IActionResult> UpdateRecommendation(
        [FromBody] UpdateRecommendationPolicyRequest body,
        CancellationToken ct)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

        await _mediator.Send(new UpdateRecommendationPolicyCommand(
            ChangedBy: userId,
            MaxActiveAssignments: body.MaxActiveAssignments,
            MaxScoringDistanceKm: body.MaxScoringDistanceKm,
            NormalAvailabilityWeight: body.NormalPriorityWeights.AvailabilityWeight,
            NormalProximityWeight: body.NormalPriorityWeights.ProximityWeight,
            NormalPerformanceWeight: body.NormalPriorityWeights.PerformanceWeight,
            UrgentAvailabilityWeight: body.UrgentPriorityWeights.AvailabilityWeight,
            UrgentProximityWeight: body.UrgentPriorityWeights.ProximityWeight,
            UrgentPerformanceWeight: body.UrgentPriorityWeights.PerformanceWeight), ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/system-config/sla ────────────────────────────────────────
    [HttpPut("sla")]
    public async Task<IActionResult> UpdateSla(
        [FromBody] UpdateSlaPolicyRequest body, CancellationToken ct)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

        await _mediator.Send(new UpdateSlaPolicyCommand(
            userId,
            body.RiskThresholdPercent,
            body.MonitorIntervalMinutes,
            body.AlertCooldownHours), ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/system-config/expense ────────────────────────────────────
    [HttpPut("expense")]
    public async Task<IActionResult> UpdateExpense(
        [FromBody] UpdateExpensePolicyCommand body, CancellationToken ct)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

        await _mediator.Send(body with { ChangedBy = userId }, ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/system-config/notifications ──────────────────────────────
    [HttpPut("notifications")]
    public async Task<IActionResult> UpdateNotifications(
        [FromBody] UpdateNotificationPolicyCommand body, CancellationToken ct)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

        await _mediator.Send(body with { ChangedBy = userId }, ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── PUT /api/system-config/requests ───────────────────────────────────
    [HttpPut("requests")]
    public async Task<IActionResult> UpdateRequests(
        [FromBody] UpdateRequestPolicyCommand body, CancellationToken ct)
    {
        var userId = Guid.Parse(
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException());

        await _mediator.Send(body with { ChangedBy = userId }, ct);

        return Ok(ApiResponse<object>.SuccessResponse(
            null!, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── GET /api/system-config/changelog ──────────────────────────────────
    [HttpGet("changelog")]
    public async Task<IActionResult> GetChangelog(
        [FromQuery] string? section,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await _mediator.Send(
            new GetConfigurationChangeLogQuery(section, page, pageSize), ct);

        return Ok(ApiResponse<PagedResult<ConfigurationChangeLogDto>>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    // ── GET /api/system-config/public (no auth) ───────────────────────────
    [HttpGet("public")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPublic(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetPublicConfigQuery(), ct);
        return Ok(ApiResponse<PublicConfigDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }
}

// ── Request body records ──────────────────────────────────────────────────

public sealed record UpdateRecommendationPolicyRequest(
    int MaxActiveAssignments,
    double MaxScoringDistanceKm,
    PriorityWeightsRequest NormalPriorityWeights,
    PriorityWeightsRequest UrgentPriorityWeights);

public sealed record PriorityWeightsRequest(
    double AvailabilityWeight,
    double ProximityWeight,
    double PerformanceWeight);

public sealed record UpdateSlaPolicyRequest(
    int RiskThresholdPercent,
    int MonitorIntervalMinutes,
    int AlertCooldownHours);