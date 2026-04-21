using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

/// <summary>
/// EF Core implementation of <see cref="IRequestMessageRepository"/>.
/// Messages are returned in strict chronological order (CreatedAt ASC).
/// </summary>
public sealed class RequestMessageRepository : IRequestMessageRepository
{
    private readonly AppDbContext _dbContext;

    public RequestMessageRepository(AppDbContext dbContext)
        => _dbContext = dbContext;

    public async Task AddAsync(
        RequestMessage message,
        CancellationToken cancellationToken = default)
    {
        await _dbContext.RequestMessages.AddAsync(message, cancellationToken);
    }

    public Task<List<RequestMessage>> GetByRequestIdAsync(
        Guid requestId,
        CancellationToken cancellationToken = default)
    {
        return _dbContext.RequestMessages
            .AsNoTracking()
            .Where(m => m.RequestId == requestId)
            .OrderBy(m => m.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task SaveChangesAsync(CancellationToken cancellationToken = default)
        => _dbContext.SaveChangesAsync(cancellationToken);
}
