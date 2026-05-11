using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class SystemConfigurationRepository
    : ISystemConfigurationRepository, ISystemConfigReader
{
    private readonly AppDbContext _db;

    // Thread-safe singleton cache
    private static SystemConfiguration? _cache;
    private static readonly SemaphoreSlim _lock = new(1, 1);

    public SystemConfigurationRepository(AppDbContext db)
    {
        _db = db;
    }

    public async Task<SystemConfiguration> GetAsync(CancellationToken ct = default)
    {
        if (_cache is not null)
            return _cache;

        await _lock.WaitAsync(ct);
        try
        {
            // Double-check after acquiring lock
            if (_cache is not null)
                return _cache;

            var config = await _db.Set<SystemConfiguration>()
                .FirstOrDefaultAsync(ct);

            if (config is null)
            {
                config = SystemConfiguration.CreateDefault();
                _db.Set<SystemConfiguration>().Add(config);
                await _db.SaveChangesAsync(ct);
            }

            _cache = config;
            return _cache;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task UpdateAsync(SystemConfiguration config, CancellationToken ct = default)
    {
        _db.Set<SystemConfiguration>().Update(config);

        // Invalidate cache so next read reloads from DB
        await _lock.WaitAsync(ct);
        try
        {
            _cache = null;
        }
        finally
        {
            _lock.Release();
        }
    }

    public async Task AddChangeLogAsync(ConfigurationChangeLog log, CancellationToken ct = default)
    {
        await _db.Set<ConfigurationChangeLog>().AddAsync(log, ct);
    }

    public async Task<List<ConfigurationChangeLog>> GetChangeLogsPagedAsync(
        string? section, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _db.Set<ConfigurationChangeLog>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(section))
            query = query.Where(l => l.Section == section);

        return await query
            .OrderByDescending(l => l.ChangedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);
    }

    public async Task<int> GetChangeLogsCountAsync(string? section, CancellationToken ct = default)
    {
        var query = _db.Set<ConfigurationChangeLog>().AsQueryable();

        if (!string.IsNullOrWhiteSpace(section))
            query = query.Where(l => l.Section == section);

        return await query.CountAsync(ct);
    }

    public async Task SaveChangesAsync(CancellationToken ct = default)
    {
        await _db.SaveChangesAsync(ct);
    }
}