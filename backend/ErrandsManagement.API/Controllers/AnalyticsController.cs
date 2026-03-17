using ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;
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
}