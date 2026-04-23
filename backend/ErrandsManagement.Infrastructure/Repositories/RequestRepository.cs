using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ErrandsManagement.Infrastructure.Repositories;

public sealed class RequestRepository : IRequestRepository
{
    private readonly AppDbContext _context;

    public RequestRepository(AppDbContext context)
    {
        _context = context;
    }
    public async Task SaveChangesAsync(CancellationToken cancellationToken)
    {
        await _context.SaveChangesAsync(cancellationToken);
    }
    public async Task AddAsync(Request request, CancellationToken cancellationToken)
    {
        await _context.Requests.AddAsync(request, cancellationToken);
    }

    public async Task<Request?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Requests
            .Include(r => r.Assignments)
            .Include(r => r.AuditLogs)
            .Include(r => r.Survey)
            .Include(r => r.Attachments)
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }
    public async Task<PagedResult<RequestListItemDto>> GetPagedAsync(
        RequestQueryParameters parameters,
        CancellationToken cancellationToken)
    {
        var query = _context.Requests
            .AsNoTracking();

        // Filtering
        if (parameters.Status.HasValue)
        {
            query = query.Where(r =>
                r.Status == parameters.Status.Value);
        }

        if (parameters.Category.HasValue)
            query = query.Where(r => r.Category == parameters.Category.Value);

        if (parameters.IsOverdue == true)
            query = query.Where(r =>
                r.Deadline < DateTime.UtcNow &&
                r.Status != RequestStatus.Completed &&
                r.Status != RequestStatus.Cancelled);

        if (parameters.From.HasValue)
            query = query.Where(r => r.CreatedAt >= parameters.From.Value);

        if (parameters.To.HasValue)
            query = query.Where(r => r.CreatedAt <= parameters.To.Value);

        // Search (example: search in Title and Description)
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchLower = parameters.Search.Trim().ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(searchLower) ||
                r.Description.ToLower().Contains(searchLower));
        }

        // Sorting
        query = parameters.SortBy?.ToLower() switch
        {
            "deadline" => parameters.Descending
                ? query.OrderByDescending(r => r.Deadline)
                : query.OrderBy(r => r.Deadline),

            "estimatedcost" => parameters.Descending
                ? query.OrderByDescending(r => r.EstimatedCost)
                : query.OrderBy(r => r.EstimatedCost),

            _ => parameters.Descending
                ? query.OrderByDescending(r => r.CreatedAt)
                : query.OrderBy(r => r.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Include(r => r.Survey)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(r => new RequestListItemDto(
                r.Id,
                r.Title,
                r.Description,
                r.Status.ToString(),
                r.Priority.ToString(),
                r.Category.ToString(),
                r.EstimatedCost,
                r.Deadline,
                r.Survey != null
            ))
            .ToListAsync(cancellationToken);

        return PagedResult<RequestListItemDto>.Create(
            items,
            parameters.Page,
            parameters.PageSize,
            totalCount);
    }
    public async Task<PagedResult<RequestListItemDto>> GetMyRequestsAsync(
    Guid requesterId,
    RequestQueryParameters parameters,
    CancellationToken cancellationToken)
    {
        var query = _context.Requests
            .AsNoTracking()
            .Where(r => r.RequesterId == requesterId);

        if (parameters.Status.HasValue)
            query = query.Where(r => r.Status == parameters.Status.Value);

        if (parameters.Category.HasValue)
            query = query.Where(r => r.Category == parameters.Category.Value);

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchLower = parameters.Search.Trim().ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(searchLower) ||
                r.Description.ToLower().Contains(searchLower));
        }

        if (parameters.From.HasValue)
            query = query.Where(r => r.CreatedAt >= parameters.From.Value);

        if (parameters.To.HasValue)
            query = query.Where(r => r.CreatedAt <= parameters.To.Value);

        if (parameters.HasSurvey.HasValue)
        {
            if (parameters.HasSurvey.Value)
            {
                query = query.Where(r => r.Survey != null);
            }
            else
            {
                query = query.Where(r => r.Survey == null && r.Status == RequestStatus.Completed);
            }
        }

        query = parameters.SortBy?.ToLower() switch
        {
            "deadline" => parameters.Descending
                ? query.OrderByDescending(r => r.Deadline)
                : query.OrderBy(r => r.Deadline),

            "estimatedcost" => parameters.Descending
                ? query.OrderByDescending(r => r.EstimatedCost)
                : query.OrderBy(r => r.EstimatedCost),

            _ => parameters.Descending
                ? query.OrderByDescending(r => r.CreatedAt)
                : query.OrderBy(r => r.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Include(r => r.Survey)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(r => new RequestListItemDto(
                r.Id,
                r.Title,
                r.Description,
                r.Status.ToString(),
                r.Priority.ToString(),
                r.Category.ToString(),
                r.EstimatedCost,
                r.Deadline,
                r.Survey != null))
            .ToListAsync(cancellationToken);

        return PagedResult<RequestListItemDto>.Create(
            items,
            parameters.Page,
            parameters.PageSize,
            totalCount);
    }
    public async Task<PagedResult<RequestListItemDto>> GetMyAssignmentsAsync(
    Guid courierId,
    RequestQueryParameters parameters,
    CancellationToken cancellationToken)
    {
        var query = _context.Requests
            .AsNoTracking()
            .Where(r => r.Assignments.Any(a => a.CourierId == courierId));

        if (parameters.Status.HasValue)
            query = query.Where(r => r.Status == parameters.Status.Value);

        if (parameters.Category.HasValue)
            query = query.Where(r => r.Category == parameters.Category.Value);

        if (parameters.From.HasValue)
            query = query.Where(r => r.CreatedAt >= parameters.From.Value);

        if (parameters.To.HasValue)
            query = query.Where(r => r.CreatedAt <= parameters.To.Value);

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var searchLower = parameters.Search.Trim().ToLower();
            query = query.Where(r =>
                r.Title.ToLower().Contains(searchLower) ||
                r.Description.ToLower().Contains(searchLower));
        }

        query = parameters.SortBy?.ToLower() switch
        {
            "deadline" => parameters.Descending
                ? query.OrderByDescending(r => r.Deadline)
                : query.OrderBy(r => r.Deadline),

            "estimatedcost" => parameters.Descending
                ? query.OrderByDescending(r => r.EstimatedCost)
                : query.OrderBy(r => r.EstimatedCost),

            _ => parameters.Descending
                ? query.OrderByDescending(r => r.CreatedAt)
                : query.OrderBy(r => r.CreatedAt)
        };

        var totalCount = await query.CountAsync(cancellationToken);

        var items = await query
            .Include(r => r.Survey)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .Select(r => new RequestListItemDto(
                r.Id,
                r.Title,
                r.Description,
                r.Status.ToString(),
                r.Priority.ToString(),
                r.Category.ToString(),
                r.EstimatedCost,
                r.Deadline,
                r.Survey != null))
            .ToListAsync(cancellationToken);

        return PagedResult<RequestListItemDto>.Create(
            items,
            parameters.Page,
            parameters.PageSize,
            totalCount);
    }

    public async Task<List<AtRiskRequestDto>> GetAtRiskRequestsAsync(
    DateTime now,
    CancellationToken cancellationToken)
    {
        var atRiskStatuses = new[] { RequestStatus.Assigned, RequestStatus.InProgress };

        return await _context.Requests
            .AsNoTracking()
            .Where(r =>
                atRiskStatuses.Contains(r.Status)
                && r.Deadline != null
                && r.Deadline > now
                && r.LastRiskAlertAt == null
                && (
                    EF.Functions.DateDiffSecond(now, r.Deadline.Value) <= 7200
                    ||
                    EF.Functions.DateDiffSecond(now, r.Deadline.Value) * 5
                        <= EF.Functions.DateDiffSecond(r.CreatedAt, r.Deadline.Value)
                )
            )
            .Select(r => new AtRiskRequestDto(
                r.Id,
                r.Title,
                r.Deadline!.Value,
                r.RequesterId,
                r.Assignments
                    .Where(a => a.CompletedAt == null)
                    .Select(a => (Guid?)a.CourierId)
                    .FirstOrDefault()
            ))
            .ToListAsync(cancellationToken);
    }
}