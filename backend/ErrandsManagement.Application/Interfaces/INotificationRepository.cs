using ErrandsManagement.Application.Notifications.Queries.GetNotifications;
using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Interfaces;

public interface INotificationRepository
{
    Task AddAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<List<Notification>> GetPagedAsync(Guid userId, NotificationQueryParameters parameters, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<List<Notification>> GetAllUnreadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<int> GetTotalCountAsync(Guid userId, bool? unreadOnly, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}