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
    Task<PagedResult<RequestListItemDto>> GetMyRequestsAsync(
        Guid requesterId,
        RequestQueryParameters parameters,
        CancellationToken cancellationToken);
    Task<PagedResult<RequestListItemDto>> GetMyAssignmentsAsync(
    Guid courierId,
    RequestQueryParameters parameters,
    CancellationToken cancellationToken);

    Task<List<AtRiskRequestDto>> GetAtRiskRequestsAsync(
    DateTime now,
    CancellationToken cancellationToken);
}