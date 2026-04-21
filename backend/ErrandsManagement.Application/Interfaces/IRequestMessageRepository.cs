namespace ErrandsManagement.Application.Interfaces;
/// <summary>
/// Persistence contract for RequestMessage entities.
/// Application layer depends on this abstraction — never on EF Core directly.
/// </summary>
public interface IRequestMessageRepository
{
    Task AddAsync(RequestMessage message, CancellationToken cancellationToken = default);

    Task<List<RequestMessage>> GetByRequestIdAsync(
        Guid requestId,
        CancellationToken cancellationToken = default);

    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
