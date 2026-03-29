using ErrandsManagement.API.Common.Responses;
using ErrandsManagement.Application.Notifications.Commands.MarkNotificationRead;
using ErrandsManagement.Application.Notifications.DTOs;
using ErrandsManagement.Application.Notifications.Queries.GetNotifications;
using ErrandsManagement.Application.Notifications.Queries.GetUnreadCount;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ErrandsManagement.API.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationsController(IMediator mediator)
        => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetNotifications(
        [FromQuery] NotificationQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var result = await _mediator.Send(
            new GetNotificationsQuery(userId, parameters), cancellationToken);

        return Ok(ApiResponse<NotificationListDto>.SuccessResponse(
            result,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkAsRead(Guid id, CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        await _mediator.Send(new MarkNotificationReadCommand(id, userId), cancellationToken);
        return NoContent();
    }

    [HttpGet("unread-count")]
    public async Task<IActionResult> GetUnreadCount(CancellationToken cancellationToken)
    {
        var userId = GetCurrentUserId();
        var count = await _mediator.Send(new GetUnreadCountQuery(userId), cancellationToken);

        return Ok(ApiResponse<int>.SuccessResponse(
            count,
            StatusCodes.Status200OK,
            HttpContext.TraceIdentifier));
    }

    private Guid GetCurrentUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User ID not found in token.");
        return Guid.Parse(claim);
    }
}