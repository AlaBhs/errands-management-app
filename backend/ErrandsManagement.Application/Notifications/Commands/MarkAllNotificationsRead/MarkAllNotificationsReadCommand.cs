using MediatR;

namespace ErrandsManagement.Application.Notifications.Commands.MarkAllNotificationsRead
{
    public sealed record MarkAllNotificationsReadCommand(Guid UserId) : IRequest;
}
