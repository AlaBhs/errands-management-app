using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.Interfaces;

public interface IRequestRepository
{
    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task AddAsync(Request request, CancellationToken cancellationToken);
    Task<Request?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<PagedResult<RequestListItemDto>> GetPagedAsync(
        RequestQueryParameters parameters,
        CancellationToken cancellationToken);

    // ============================ Temporary debug methods ============================
    //Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken);
    //string GetEntityState(object entity);
    //void MarkAsAdded<T>(T entity) where T : class;
    // ============================ Temporary debug methods ============================
}