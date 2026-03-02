using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Common.Interfaces;

public interface IRequestRepository
{
    Task SaveChangesAsync(CancellationToken cancellationToken);
    Task AddAsync(Request request, CancellationToken cancellationToken);
    Task<Request?> GetByIdAsync(Guid id, CancellationToken cancellationToken);
    Task<List<Request>> GetAllAsync(CancellationToken cancellationToken);

    // ============================ Temporary debug methods ============================
    //Task<bool> ExistsAsync(Guid id, CancellationToken cancellationToken);
    //string GetEntityState(object entity);
    //void MarkAsAdded<T>(T entity) where T : class;
    // ============================ Temporary debug methods ============================
}