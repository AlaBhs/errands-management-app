using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Common.Interfaces;

public interface IRequestRepository
{
    Task AddAsync(Request request, CancellationToken cancellationToken);
    Task<Request?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<List<Request>> GetAllAsync(CancellationToken cancellationToken);
}