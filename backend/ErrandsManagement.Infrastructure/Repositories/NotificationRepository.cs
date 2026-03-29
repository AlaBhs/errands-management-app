using ErrandsManagement.Application.Notifications.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly AppDbContext _context;

    public NotificationRepository(AppDbContext context)
        => _context = context;

    public async Task AddAsync(Notification notification, CancellationToken cancellationToken = default)
        => await _context.Notifications.AddAsync(notification, cancellationToken);

    public async Task<List<Notification>> GetByUserIdAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        => await _context.Notifications
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync(cancellationToken);

    public async Task<Notification?> GetByIdAsync(
        Guid id,
        CancellationToken cancellationToken = default)
        => await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);

    public async Task<int> GetUnreadCountAsync(
        Guid userId,
        CancellationToken cancellationToken = default)
        => await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);

    public async Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => await _context.SaveChangesAsync(cancellationToken);
}