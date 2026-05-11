
using UserPreferencesEntity = ErrandsManagement.Domain.Entities.UserPreferences;
namespace ErrandsManagement.Application.Interfaces;

public interface IUserPreferencesRepository
{
    Task<UserPreferencesEntity?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(UserPreferencesEntity prefs, CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}