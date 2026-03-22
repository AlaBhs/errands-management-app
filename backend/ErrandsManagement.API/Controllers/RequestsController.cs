using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Application.Requests.Commands.StartRequest;
using ErrandsManagement.Application.Requests.Commands.SubmitSurvey;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Application.Requests.Queries.GetMyAssignments;
using ErrandsManagement.Application.Requests.Queries.GetMyRequests;
using ErrandsManagement.Application.Requests.Queries.GetRequestById;
using ErrandsManagement.Domain.Common.Exceptions;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/[controller]")]
//[Authorize] // Global authorization can be applied here, disabled for demonstration purposes. Enable in production.
public sealed class RequestsController : ControllerBase
{

    private readonly ISender _mediator;

    public RequestsController(ISender mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> Create(
          [FromBody] CreateRequestDto body,
          CancellationToken cancellationToken)
    {
        var requesterId = GetCurrentUserId();

        var command = new CreateRequestCommand(
            body.Title,
            body.Description,
            body.DeliveryAddress,
            body.Priority,
            body.Category,
            body.ContactPerson,
            body.ContactPhone,
            body.Comment,
            body.Deadline,
            body.EstimatedCost,
            requesterId);      

        var id = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id },
            ApiResponse<Guid>.SuccessResponse(
                id, StatusCodes.Status201Created, HttpContext.TraceIdentifier));
    }

    [HttpGet("{id}")]
    [Authorize(Roles = "Admin,Collaborator,Courier")]
    public async Task<IActionResult> GetById(
    Guid id,
    CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetRequestByIdQuery(id),
            cancellationToken);

        if (result is null)
            return NotFound();

        return Ok(ApiResponse<RequestDetailsDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpGet]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(
        [FromQuery] RequestQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetAllRequestsQuery(parameters),
            cancellationToken);

        return Ok(ApiResponse<PagedResult<RequestListItemDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }
    [HttpGet("mine")]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> GetMine(
    [FromQuery] RequestQueryParameters parameters,
    CancellationToken cancellationToken)
    {
        var requesterId = GetCurrentUserId();

        var result = await _mediator.Send(
            new GetMyRequestsQuery(requesterId, parameters),
            cancellationToken);

        return Ok(ApiResponse<PagedResult<RequestListItemDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }
    [HttpGet("assignments")]
    [Authorize(Roles = "Courier")]
    public async Task<IActionResult> GetMyAssignments(
    [FromQuery] RequestQueryParameters parameters,
    CancellationToken cancellationToken)
    {
        var courierId = GetCurrentUserId();

        var result = await _mediator.Send(
            new GetMyAssignmentsQuery(courierId, parameters),
            cancellationToken);

        return Ok(ApiResponse<PagedResult<RequestListItemDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/assign")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Assign(
        Guid id,
        [FromBody] AssignRequestDto request,
        CancellationToken cancellationToken)
    {
        var command = new AssignRequestCommand(id, request.CourierId);

        await _mediator.Send(command, cancellationToken);

        return NoContent();
    }

    [HttpPost("{id:guid}/start")]
    [Authorize(Roles = "Courier")]
    public async Task<IActionResult> Start(Guid id, CancellationToken cancellationToken)
    {
        var command = new StartRequestCommand(id);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "Courier")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [RequestFormLimits(MultipartBodyLengthLimit = 10 * 1024 * 1024)]
    public async Task<IActionResult> Complete(
    Guid id,
    [FromForm] decimal? actualCost,
    [FromForm] string? note,
    IFormFile? dischargePhoto,
    CancellationToken cancellationToken)
    {
        Stream? photoStream = null;

        if (dischargePhoto is not null && dischargePhoto.Length > 0)
            photoStream = dischargePhoto.OpenReadStream();

        await using var _ = photoStream;

        var command = new CompleteRequestCommand(
            RequestId: id,
            ActualCost: actualCost,
            Note: note,
            DischargePhotoFileName: dischargePhoto?.FileName,
            DischargePhotoContentType: dischargePhoto?.ContentType,
            DischargePhotoSize: dischargePhoto?.Length ?? 0,
            DischargePhotoStream: photoStream);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }
    [HttpPost("{id:guid}/cancel")]
    [Authorize(Roles = "Admin,Collaborator,Courier")]
    public async Task<IActionResult> Cancel(
        Guid id,
        [FromBody] CancelRequestDto request,
        CancellationToken cancellationToken)
    {
        var callerRole = User.FindFirstValue("role") ?? string.Empty;

        var command = new CancelRequestCommand(id, request.Reason, callerRole);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/survey")]
    [Authorize(Roles = "Collaborator")]
    public async Task<IActionResult> SubmitSurvey(
    Guid id,
    SubmitSurveyDto request,
    CancellationToken cancellationToken)
    {

        var command = new SubmitSurveyCommand(
            id,
            request.Rating,
            request.Comment);

        await _mediator.Send(command, cancellationToken);

        return Ok(ApiResponse<object>.SuccessResponse(
            null,
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

    // ============================= DEBUG =============================
    [HttpGet("ping")]
    public IActionResult Ping()
    {
        return Ok("API is working");
    }

    [HttpGet("test-exception")]
    public IActionResult TestException()
    {
        throw new InvalidRequestStateException("Test domain exception.");
    }
    // ============================= DEBUG =============================
}