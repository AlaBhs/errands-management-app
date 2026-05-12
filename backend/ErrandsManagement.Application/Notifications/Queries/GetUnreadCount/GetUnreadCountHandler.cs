using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Notifications.Queries.GetUnreadCount
{
    public sealed class GetUnreadCountHandler : IRequestHandler<GetUnreadCountQuery, int>
    {
        private readonly INotificationRepository _repository;

        public GetUnreadCountHandler(INotificationRepository repository)
            => _repository = repository;

        public async Task<int> Handle(
            GetUnreadCountQuery request,
            CancellationToken cancellationToken)
            => await _repository.GetUnreadCountAsync(request.UserId, cancellationToken);
    }
}
