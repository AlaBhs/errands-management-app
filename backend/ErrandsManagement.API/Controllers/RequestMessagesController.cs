using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.RequestMessages.Commands;
using ErrandsManagement.Application.RequestMessages.DTOs;
using ErrandsManagement.Application.RequestMessages.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

/// <summary>
/// Handles the discussion thread for a specific request.
///
/// POST /api/requests/{id}/messages  → Send a message
/// GET  /api/requests/{id}/messages  → Get full thread (chronological)
///
/// Participant authorization is enforced in the Application layer handlers,
/// not here — keeping the controller thin and free of business rules.
/// </summary>
[ApiController]
[Route("api/requests/{requestId:guid}/messages")]
[Authorize(Roles = "Admin,Collaborator,Courier")]
public sealed class RequestMessagesController : ControllerBase
{
    private readonly ISender _mediator;

    public RequestMessagesController(ISender mediator)
        => _mediator = mediator;

    /// <summary>
    /// Send a message to the request discussion thread.
    /// Only participants (owner, assigned courier, admin) may send.
    /// </summary>
    /// <response code="201">Message created. Returns the new message's Guid.</response>
    /// <response code="403">Caller is not a participant of this request.</response>
    /// <response code="404">Request not found.</response>
    [HttpPost]
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
    [HttpGet]
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

    // ── Private helpers ─────────────────────────────────────────────────────

    private Guid GetCurrentUserId()
    {
        var raw = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue("sub")
            ?? throw new UnauthorizedAccessException("User identity not found in token.");

        return Guid.Parse(raw);
    }
}
