using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
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
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }
    public async Task<List<RequestListItemDto>> GetAllAsync(
        CancellationToken cancellationToken)
    {
        return await _context.Requests
            .AsNoTracking()
            .Select(r => new RequestListItemDto(
                r.Id,
                r.Title,
                r.Description,
                r.Status.ToString(),
                r.Priority.ToString(),
                r.EstimatedCost,
                r.Deadline))
            .ToListAsync(cancellationToken);
    }
}