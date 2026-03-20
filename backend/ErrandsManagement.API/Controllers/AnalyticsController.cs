using ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;
using ErrandsManagement.Application.Analytics.Queries.GetCostBreakdown;
using ErrandsManagement.Application.Analytics.Queries.GetCourierPerformance;
using ErrandsManagement.Application.Analytics.Queries.GetRequestTrend;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/analytics")]
[Authorize(Roles = "Admin")]
public sealed class AnalyticsController : ControllerBase
{
    private readonly IMediator _mediator;

    public AnalyticsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(
     [FromQuery] DateTime? from,
     [FromQuery] DateTime? to,
     CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAnalyticsSummaryQuery(from, to), cancellationToken);
        return Ok(result);
    }

    [HttpGet("trend")]
    public async Task<IActionResult> GetTrend(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetRequestTrendQuery(from, to), cancellationToken);
        return Ok(result);
    }

    [HttpGet("cost-breakdown")]
    public async Task<IActionResult> GetCostBreakdown(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetCostBreakdownQuery(from, to), cancellationToken);
        return Ok(result);
    }

    [HttpGet("courier-performance")]
    public async Task<IActionResult> GetCourierPerformance(
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetCourierPerformanceQuery(from, to), cancellationToken);
        return Ok(result);
    }
}