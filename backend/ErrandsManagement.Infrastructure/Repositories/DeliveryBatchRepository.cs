using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DeliveryBatches.DTOs;
using ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatches;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class DeliveryBatchRepository : IDeliveryBatchRepository
{
    private readonly AppDbContext _context;

    public DeliveryBatchRepository(AppDbContext context)
        => _context = context;

    public async Task AddAsync(DeliveryBatch batch, CancellationToken cancellationToken)
        => await _context.DeliveryBatches.AddAsync(batch, cancellationToken);

    public async Task<DeliveryBatch?> GetByIdAsync(Guid id, CancellationToken ct)
    => await _context.DeliveryBatches
        .Include(b => b.Attachments)
        .FirstOrDefaultAsync(b => b.Id == id, ct);

    public async Task<PagedResult<DeliveryBatchListItemDto>> GetPagedAsync(
        DeliveryBatchQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = _context.DeliveryBatches.AsNoTracking();

        // Filter by status at DB level
        if (parameters.Status.HasValue)
            query = query.Where(b => b.Status == parameters.Status.Value);

        // Search by title or client name
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var term = parameters.Search.Trim().ToLower();
            query = query.Where(b =>
                b.Title.ToLower().Contains(term) ||
                b.ClientName.ToLower().Contains(term));
        }

        query = query.OrderByDescending(b => b.CreatedAt);

        var totalCount = await query.CountAsync(cancellationToken);

        // Projection to DTO happens at DB level — no full entity loaded
        var items = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(b => new DeliveryBatchListItemDto(
                b.Id,
                b.Title,
                b.ClientName,
                b.Status.ToString(),
                b.CreatedAt))
            .ToListAsync(cancellationToken);

        return PagedResult<DeliveryBatchListItemDto>.Create(
            items,
            parameters.Page,
            parameters.PageSize,
            totalCount);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
        => await _context.SaveChangesAsync(cancellationToken);
}