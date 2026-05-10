using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Interfaces;

public interface IUserPreferencesRepository
{
    Task<UserPreferences?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(UserPreferences prefs, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}