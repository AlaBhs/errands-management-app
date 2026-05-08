using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Interfaces;

public interface IOperationalReportRepository
{
    Task<OperationalReport?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<OperationalReport?> GetMostRecentAsync(CancellationToken ct = default);
    Task AddAsync(OperationalReport report, CancellationToken ct = default);
    Task<IReadOnlyList<OperationalReport>> GetAllAsync(CancellationToken ct = default);
    Task SaveChangesAsync(CancellationToken ct = default);
}
