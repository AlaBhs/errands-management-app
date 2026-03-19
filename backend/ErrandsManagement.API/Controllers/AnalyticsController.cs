using ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;
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

    /// <summary>GET /api/analytics/summary</summary>
    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAnalyticsSummaryQuery(), cancellationToken);
        return Ok(result);
    }

    /// <summary>GET /api/analytics/trend</summary>
    [HttpGet("trend")]
    public async Task<IActionResult> GetTrend(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetRequestTrendQuery(), cancellationToken);
        return Ok(result);
    }
}