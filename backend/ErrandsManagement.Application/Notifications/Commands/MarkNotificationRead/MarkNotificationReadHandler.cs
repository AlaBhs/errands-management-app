using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Commands.MarkNotificationRead;

public sealed class MarkNotificationReadHandler : IRequestHandler<MarkNotificationReadCommand>
{
    private readonly INotificationRepository _repository;

    public MarkNotificationReadHandler(INotificationRepository repository)
        => _repository = repository;

    public async Task Handle(
        MarkNotificationReadCommand request,
        CancellationToken cancellationToken)
    {
        var notification = await _repository
            .GetByIdAsync(request.NotificationId, cancellationToken)
            ?? throw new NotFoundException(nameof(Notification), request.NotificationId);

        if (notification.UserId != request.UserId)
            throw new UnauthorizedAccessException("Notification does not belong to this user.");

        notification.MarkAsRead();
        await _repository.SaveChangesAsync(cancellationToken);
    }
}