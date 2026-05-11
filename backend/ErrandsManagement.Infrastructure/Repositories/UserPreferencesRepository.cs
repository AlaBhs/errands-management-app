using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class UserPreferencesRepository : IUserPreferencesRepository
{
    private readonly AppDbContext _db;

    public UserPreferencesRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<UserPreferences?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _db.Set<UserPreferences>()
            .FirstOrDefaultAsync(p => p.UserId == userId, ct);
    }

    public async Task AddAsync(UserPreferences prefs, CancellationToken ct = default)
    {
        await _db.Set<UserPreferences>().AddAsync(prefs, ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct = default)
    {
        await _db.SaveChangesAsync(ct);
    }
}