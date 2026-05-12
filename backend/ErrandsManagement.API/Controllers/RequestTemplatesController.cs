using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.RequestTemplates.Commands.CreateRequestTemplate;
using ErrandsManagement.Application.RequestTemplates.Commands.DeleteRequestTemplate;
using ErrandsManagement.Application.RequestTemplates.DTOs;
using ErrandsManagement.Application.RequestTemplates.Queries.GetMyRequestTemplates;
using ErrandsManagement.Application.RequestTemplates.Queries.GetRequestTemplateById;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/request-templates")]
[Authorize]
public sealed class RequestTemplatesController : ControllerBase
{
    private readonly ISender _mediator;

    public RequestTemplatesController(ISender mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// POST /api/request-templates
    /// Create a reusable template from an existing request.
    /// </summary>
    [HttpPost]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> CreateFromRequest(
        [FromBody] CreateRequestTemplateDto body,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var id = await _mediator.Send(
            new CreateRequestTemplateFromRequestCommand(
                body.RequestId,
                body.TemplateName,
                userId),
            cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<Guid>.SuccessResponse(
                id, StatusCodes.Status201Created, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// GET /api/request-templates?page=1&pageSize=10&search=office&category=OfficeSupplies
    /// List the caller's templates with pagination, search, and optional category filter.
    /// </summary>
    [HttpGet]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> GetMyTemplates(
        [FromQuery] RequestTemplateQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var result = await _mediator.Send(
            new GetMyRequestTemplatesQuery(userId, parameters),
            cancellationToken);

        return Ok(ApiResponse<PagedResult<RequestTemplateListItemDto>>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// GET /api/request-templates/{id}
    /// Get a single template (only accessible by its creator).
    /// </summary>
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> GetById(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var result = await _mediator.Send(
            new GetRequestTemplateByIdQuery(id, userId),
            cancellationToken);

        return Ok(ApiResponse<RequestTemplateDetailsDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// DELETE /api/request-templates/{id}
    /// Delete a template. Only the creator or an Admin may delete.
    /// </summary>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Collaborator,Admin")]
    public async Task<IActionResult> Delete(
        Guid id,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Admin");

        await _mediator.Send(
            new DeleteRequestTemplateCommand(id, userId, isAdmin),
            cancellationToken);

        return NoContent();
    }

    // ── Private helpers ──────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User identity not found in token.");
        return Guid.Parse(value);
    }
}

// ── Request body DTO (local to this controller) ───────────────────────────
public sealed record CreateRequestTemplateDto(
    Guid RequestId,
    string TemplateName);