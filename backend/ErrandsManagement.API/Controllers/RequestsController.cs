using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.CourierRecommendation.DTOs;
using ErrandsManagement.Application.CourierRecommendation.Queries.GetCourierCandidates;
using ErrandsManagement.Application.RequestMessages.Commands;
using ErrandsManagement.Application.RequestMessages.DTOs;
using ErrandsManagement.Application.RequestMessages.Queries;
using ErrandsManagement.Application.Requests.Commands.AddExpenseRecord;
using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Application.Requests.Commands.MarkExpenseReconciled;
using ErrandsManagement.Application.Requests.Commands.RemoveExpenseRecord;
using ErrandsManagement.Application.Requests.Commands.SetAdvancedAmount;
using ErrandsManagement.Application.Requests.Commands.StartRequest;
using ErrandsManagement.Application.Requests.Commands.SubmitSurvey;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Application.Requests.Queries.GetExpenseSummary;
using ErrandsManagement.Application.Requests.Queries.GetMyAssignments;
using ErrandsManagement.Application.Requests.Queries.GetMyRequests;
using ErrandsManagement.Application.Requests.Queries.GetRequestById;
using ErrandsManagement.Application.Requests.Queries.GetRequestExpenses;
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
    [Consumes("multipart/form-data", "application/x-www-form-urlencoded")]
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

    [HttpGet("{id:guid}/candidates")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetCandidates(
    Guid id,
    CancellationToken cancellationToken)
    {
        var result = await _mediator.Send(
            new GetCourierCandidatesQuery(id),
            cancellationToken);

        return Ok(ApiResponse<List<CourierScoreDto>>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Send a message to the request discussion thread.
    /// Only participants (owner, assigned courier, admin) may send.
    /// </summary>
    /// <response code="201">Message created. Returns the new message's Guid.</response>
    /// <response code="403">Caller is not a participant of this request.</response>
    /// <response code="404">Request not found.</response>
    [HttpPost("{requestId:guid}/messages")]
    [Authorize(Roles = "Admin,Collaborator,Courier")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SendMessage(
        Guid requestId,
        [FromBody] SendMessageDto body,
        CancellationToken cancellationToken)
    {
        var senderId = GetCurrentUserId();

        var command = new SendRequestMessageCommand(
            RequestId: requestId,
            SenderId: senderId,
            Content: body.Content);

        var messageId = await _mediator.Send(command, cancellationToken);

        return CreatedAtAction(
            nameof(GetMessages),
            new { requestId },
            ApiResponse<Guid>.SuccessResponse(
                messageId,
                StatusCodes.Status201Created,
                HttpContext.TraceIdentifier));
    }

    /// <summary>
    /// Retrieve the full discussion thread for the request.
    /// Messages are ordered chronologically (oldest first).
    /// Only participants (owner, assigned courier, admin) may read.
    /// </summary>
    /// <response code="200">List of messages in chronological order.</response>
    /// <response code="403">Caller is not a participant of this request.</response>
    /// <response code="404">Request not found.</response>
    [HttpGet("{requestId:guid}/messages")]
    [Authorize(Roles = "Admin,Collaborator,Courier")]
    [ProducesResponseType(typeof(ApiResponse<List<RequestMessageDto>>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMessages(
        Guid requestId,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();

        var query = new GetRequestMessagesQuery(
            RequestId: requestId,
            RequestingUserId: userId);

        var messages = await _mediator.Send(query, cancellationToken);

        return Ok(ApiResponse<List<RequestMessageDto>>.SuccessResponse(
            messages,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }


    [HttpGet("{requestId:guid}/expenses")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAll(Guid requestId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetRequestExpensesQuery(requestId), ct);
        return Ok(ApiResponse<IReadOnlyList<ExpenseRecordDto>>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    [HttpGet("{requestId:guid}/expenses/summary")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetSummary(Guid requestId, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetExpenseSummaryQuery(requestId), ct);
        return Ok(ApiResponse<ExpenseSummaryDto>.SuccessResponse(
            result, StatusCodes.Status200OK, HttpContext.TraceIdentifier));
    }

    [HttpPost("{requestId:guid}/expenses")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AddExpense(
        Guid requestId,
        [FromBody] AddExpenseRecordDto body,
        CancellationToken ct)
    {
        var createdBy = User.FindFirstValue(ClaimTypes.Email)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? "unknown";

        var id = await _mediator.Send(
            new AddExpenseRecordCommand(
                requestId, body.Category, body.Amount, createdBy, body.Description), ct);

        return CreatedAtAction(nameof(GetAll), new { requestId },
            ApiResponse<Guid>.SuccessResponse(
                id, StatusCodes.Status201Created, HttpContext.TraceIdentifier));
    }

    [HttpDelete("{requestId:guid}/expenses/{expenseId:guid}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveExpense(
        Guid requestId, Guid expenseId, CancellationToken ct)
    {
        await _mediator.Send(
            new RemoveExpenseRecordCommand(requestId, expenseId), ct);
        return NoContent();
    }

    [HttpPost("{requestId:guid}/expenses/advanced-amount")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> SetAdvancedAmount(
        Guid requestId,
        [FromBody] SetAdvancedAmountDto body,
        CancellationToken ct)
    {
        await _mediator.Send(
            new SetAdvancedAmountCommand(requestId, body.Amount), ct);
        return NoContent();
    }

    [HttpPost("{requestId:guid}/expenses/reconcile")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Reconcile(Guid requestId, CancellationToken ct)
    {
        await _mediator.Send(
            new MarkExpenseReconciledCommand(requestId), ct);
        return NoContent();
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