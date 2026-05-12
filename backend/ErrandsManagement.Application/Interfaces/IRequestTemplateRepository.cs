using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.RequestTemplates.DTOs;
using ErrandsManagement.Application.RequestTemplates.Queries.GetMyRequestTemplates;
using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Interfaces;

public interface IRequestTemplateRepository
{
    Task AddAsync(RequestTemplate template, CancellationToken cancellationToken);
    Task<RequestTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task DeleteAsync(RequestTemplate template, CancellationToken cancellationToken);
    Task<bool> ExistsByNameAndUserAsync(string name, Guid userId, CancellationToken cancellationToken);
    Task<PagedResult<RequestTemplateListItemDto>> GetPagedByUserAsync(
        Guid userId,
        RequestTemplateQueryParameters parameters,
        CancellationToken cancellationToken);
    Task SaveChangesAsync(CancellationToken cancellationToken);
}