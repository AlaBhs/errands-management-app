using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DeliveryBatches.DTOs;
using ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatches;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Interfaces;

public interface IDeliveryBatchRepository
{
    Task AddAsync(DeliveryBatch batch, CancellationToken cancellationToken);
    Task<DeliveryBatch?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedResult<DeliveryBatchListItemDto>> GetPagedAsync(
        DeliveryBatchQueryParameters parameters,
        CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}