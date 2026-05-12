using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace ErrandsManagement.API.Hubs;

/// <summary>
/// SignalR hub for real-time request messaging.
///
/// Clients call <see cref="JoinRequestGroup"/> to subscribe to a specific
/// request thread and <see cref="LeaveRequestGroup"/> when they navigate away.
///
/// Group naming convention: "request-{requestId}"
///
/// Security: JWT authentication is enforced via [Authorize].
/// Before adding a client to a group, we verify the user is a participant
/// (owner, assigned courier, or admin) to prevent unauthorized eavesdropping.
/// </summary>
[Authorize]
public sealed class RequestMessagingHub : Hub
{
    private readonly IRequestRepository _requestRepository;
    private readonly IUserRepository _userRepository;

    public RequestMessagingHub(
        IRequestRepository requestRepository,
        IUserRepository userRepository)
    {
        _requestRepository = requestRepository;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Client calls this to subscribe to the live message stream for a request.
    /// Authorization is validated here — not just at the controller level.
    /// </summary>
    public async Task JoinRequestGroup(Guid requestId)
    {
        var userId = GetCurrentUserId();

        if (!await IsParticipantAsync(requestId, userId))
            throw new HubException(
                $"Access denied: you are not a participant of request {requestId}.");

        var groupName = GetGroupName(requestId);
        await Groups.AddToGroupAsync(Context.ConnectionId, groupName);

        Console.WriteLine(
            $"[RequestMessagingHub] User {userId} joined group {groupName}");
    }

    /// <summary>
    /// Client calls this to unsubscribe from the live message stream.
    /// </summary>
    public async Task LeaveRequestGroup(Guid requestId)
    {
        var groupName = GetGroupName(requestId);
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, groupName);

        Console.WriteLine(
            $"[RequestMessagingHub] User {GetCurrentUserId()} left group {groupName}");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        // SignalR automatically removes the connection from all groups on disconnect.
        await base.OnDisconnectedAsync(exception);
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    public static string GetGroupName(Guid requestId) => $"request-{requestId}";

    private Guid GetCurrentUserId()
    {
        var raw = Context.UserIdentifier
            ?? throw new HubException("User is not authenticated.");

        if (!Guid.TryParse(raw, out var userId))
            throw new HubException("Invalid user identifier.");

        return userId;
    }

    private async Task<bool> IsParticipantAsync(Guid requestId, Guid userId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId, default);
        if (request is null) return false;

        var user = await _userRepository.FindByIdAsync(userId, default);
        if (user is null) return false;

        var role = user.Roles.FirstOrDefault() ?? string.Empty;

        if (string.Equals(role, UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase))
            return true;

        if (request.RequesterId == userId)
            return true;

        return request.Assignments.Any(a => a.CourierId == userId);
    }
}
