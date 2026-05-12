using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Analytics.DTOs;
using ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;
using ErrandsManagement.Application.Analytics.Queries.GetCostBreakdown;
using ErrandsManagement.Application.Analytics.Queries.GetCourierPerformance;
using ErrandsManagement.Application.Analytics.Queries.GetMyCourierPerformance;
using ErrandsManagement.Application.Analytics.Queries.GetRequestTrend;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize]
public sealed class AnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnalyticsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("summary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetSummary(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAnalyticsSummaryQuery(from, to), cancellationToken);

        return Ok(ApiResponse<AnalyticsSummaryDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet("trend")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetTrend(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetRequestTrendQuery(from, to), cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<TrendPointDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet("cost-breakdown")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetCostBreakdown(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetCostBreakdownQuery(from, to), cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<CostBreakdownDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet("courier-performance")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetCourierPerformance(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetCourierPerformanceQuery(from, to), cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<CourierPerformanceDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet("my-performance")]
    [Authorize(Roles = "Courier")]
    public async Task<IActionResult> GetMyPerformance(
        [FromQuery] int days = 30,
        CancellationToken cancellationToken = default)
    {
        var courierId = GetCurrentUserId();

        var result = await _mediator.Send(
            new GetMyCourierPerformanceQuery(courierId, days),
            cancellationToken);

        return Ok(ApiResponse<CourierPerformanceDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }


    // ── Private helpers ────────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException(
                "User identity not found in token.");

        return Guid.Parse(value);
    }
}