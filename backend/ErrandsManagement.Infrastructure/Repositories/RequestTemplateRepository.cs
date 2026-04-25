using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.RequestTemplates.DTOs;
using ErrandsManagement.Application.RequestTemplates.Queries.GetMyRequestTemplates;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class RequestTemplateRepository : IRequestTemplateRepository
{
    private readonly AppDbContext _context;

    public RequestTemplateRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(RequestTemplate template, CancellationToken cancellationToken)
        => await _context.Set<RequestTemplate>().AddAsync(template, cancellationToken);

    public async Task<RequestTemplate?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
        => await _context.Set<RequestTemplate>()
            .FirstOrDefaultAsync(t => t.Id == id, cancellationToken);

    public Task DeleteAsync(RequestTemplate template, CancellationToken cancellationToken)
    {
        _context.Set<RequestTemplate>().Remove(template);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsByNameAndUserAsync(
        string name, Guid userId, CancellationToken cancellationToken)
        => await _context.Set<RequestTemplate>()
            .AnyAsync(
                t => t.CreatedBy == userId && t.Name.ToLower() == name.ToLower().Trim(),
                cancellationToken);

    public async Task<PagedResult<RequestTemplateListItemDto>> GetPagedByUserAsync(
        Guid userId,
        RequestTemplateQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = _context.Set<RequestTemplate>()
            .AsNoTracking()
            .Where(t => t.CreatedBy == userId);

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var term = parameters.Search.Trim().ToLower();
            query = query.Where(t => t.Name.ToLower().Contains(term));
        }

        if (parameters.Category.HasValue)
            query = query.Where(t => t.Category == parameters.Category.Value);

        query = query.OrderBy(t => t.Name);

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(t => new RequestTemplateListItemDto(
                t.Id,
                t.Name,
                t.Title,
                t.Category.ToString(),
                t.EstimatedCost,
                t.CreatedAt))
            .ToListAsync(cancellationToken);

        return PagedResult<RequestTemplateListItemDto>.Create(
            items, parameters.Page, parameters.PageSize, totalCount);
    }

    public async Task SaveChangesAsync(CancellationToken cancellationToken)
        => await _context.SaveChangesAsync(cancellationToken);
}