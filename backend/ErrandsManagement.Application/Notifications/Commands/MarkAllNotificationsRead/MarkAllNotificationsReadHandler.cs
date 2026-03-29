using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Commands.MarkAllNotificationsRead
{
    public sealed class MarkAllNotificationsReadHandler : IRequestHandler<MarkAllNotificationsReadCommand>
    {
        private readonly INotificationRepository _repository;

        public MarkAllNotificationsReadHandler(INotificationRepository repository)
            => _repository = repository;

        public async Task Handle(
            MarkAllNotificationsReadCommand request,
            CancellationToken cancellationToken)
        {
            var notifications = await _repository.GetAllUnreadAsync(
                request.UserId, cancellationToken);

            if (!notifications.Any())
                return;

            foreach (var notification in notifications)
                notification.MarkAsRead();

            await _repository.SaveChangesAsync(cancellationToken);
        }
    }
}
