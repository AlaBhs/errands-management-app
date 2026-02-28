using ErrandsManagement.Application.Common.Interfaces;
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

    public async Task AddAsync(Request request, CancellationToken cancellationToken)
    {
        await _context.Requests.AddAsync(request, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<Request?> GetByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Requests
            .FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
    }
}