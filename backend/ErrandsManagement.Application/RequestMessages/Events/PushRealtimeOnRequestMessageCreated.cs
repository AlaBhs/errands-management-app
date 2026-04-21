using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.RequestMessages.DTOs;
using MediatR;

namespace ErrandsManagement.Application.RequestMessages.Events;

/// <summary>
/// Step 2 of the messaging real-time pipeline.
///
/// Listens to <see cref="RequestMessageCreatedEvent"/> and pushes the
/// new message to the request-specific SignalR group via
/// <see cref="IRequestMessagingRealtimeService"/>.
///
/// This delivers the message payload instantly to ALL connected participants
/// (not just those who have a notification pending), enabling live chat UX.
/// </summary>
public sealed class PushRealtimeOnRequestMessageCreated
    : INotificationHandler<RequestMessageCreatedEvent>
{
    private readonly IRequestMessagingRealtimeService _realtimeService;
    private readonly IUserRepository _userRepository;

    public PushRealtimeOnRequestMessageCreated(
        IRequestMessagingRealtimeService realtimeService,
        IUserRepository userRepository)
    {
        _realtimeService = realtimeService;
        _userRepository = userRepository;
    }

    public async Task Handle(
        RequestMessageCreatedEvent notification,
        CancellationToken cancellationToken)
    {
        // Resolve sender display info for the DTO
        var sender = await _userRepository.FindByIdAsync(
            notification.SenderId, cancellationToken);

        var senderName = sender?.FullName ?? "Unknown";
        var senderRole = sender?.Roles.FirstOrDefault() ?? "Unknown";

        var messageDto = new RequestMessageDto(
            Id: notification.MessageId,
            RequestId: notification.RequestId,
            SenderId: notification.SenderId,
            SenderName: senderName,
            SenderRole: senderRole,
            Content: notification.Content,
            CreatedAt: notification.CreatedAt);

        await _realtimeService.PushMessageToRequestGroupAsync(
            messageDto, cancellationToken);
    }
}
