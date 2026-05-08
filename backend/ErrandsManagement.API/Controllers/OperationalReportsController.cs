using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.OperationalReports.Commands.GenerateOperationalReport;
using ErrandsManagement.Application.OperationalReports.DTOs;
using ErrandsManagement.Application.OperationalReports.Queries.GetOperationalReportById;
using ErrandsManagement.Application.OperationalReports.Queries.GetOperationalReports;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/operational-reports")]
[Authorize(Roles = "Admin")]
public sealed class OperationalReportsController : ControllerBase
{
    private readonly IMediator _mediator;

    public OperationalReportsController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> Generate(
        [FromBody] GenerateReportRequest? body,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GenerateOperationalReportCommand(
                GetCurrentUserId(),
                body?.From,
                body?.To),
            cancellationToken);

        return Ok(ApiResponse<OperationalReportDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(new GetOperationalReportsQuery(), cancellationToken);

        return Ok(ApiResponse<IReadOnlyList<OperationalReportSummaryDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetOperationalReportByIdQuery(id), cancellationToken);

        return Ok(ApiResponse<OperationalReportDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private Guid GetCurrentUserId() =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User identity not found in token."));
}

public sealed record GenerateReportRequest(DateTime? From, DateTime? To);
