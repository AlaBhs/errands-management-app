using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class OperationalReportRepository : IOperationalReportRepository
{
    private readonly AppDbContext _context;

    public OperationalReportRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<OperationalReport?> GetByIdAsync(Guid id, CancellationToken ct = default)
        => await _context.Set<OperationalReport>()
            .FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<OperationalReport?> GetMostRecentAsync(CancellationToken ct = default)
        => await _context.Set<OperationalReport>()
            .OrderByDescending(r => r.GeneratedAt)
            .FirstOrDefaultAsync(ct);

    public async Task AddAsync(OperationalReport report, CancellationToken ct = default)
        => await _context.Set<OperationalReport>().AddAsync(report, ct);

    public async Task<IReadOnlyList<OperationalReport>> GetAllAsync(CancellationToken ct = default)
        => await _context.Set<OperationalReport>()
            .AsNoTracking()
            .OrderByDescending(r => r.GeneratedAt)
            .ToListAsync(ct);

    public async Task SaveChangesAsync(CancellationToken ct = default)
        => await _context.SaveChangesAsync(ct);
}
