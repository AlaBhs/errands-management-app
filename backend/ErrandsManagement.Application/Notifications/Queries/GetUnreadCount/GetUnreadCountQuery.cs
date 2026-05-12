using MediatR;

namespace ErrandsManagement.Application.Notifications.Queries.GetUnreadCount
{
    public sealed record GetUnreadCountQuery(Guid UserId) : IRequest<int>;
}
