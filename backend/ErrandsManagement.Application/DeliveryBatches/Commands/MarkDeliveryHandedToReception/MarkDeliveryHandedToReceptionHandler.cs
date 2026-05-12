using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.MarkDeliveryHandedToReception;

public sealed class MarkDeliveryHandedToReceptionHandler
    : IRequestHandler<MarkDeliveryHandedToReceptionCommand>
{
    private readonly IDeliveryBatchRepository _repository;
    private readonly IMediator _mediator;

    public MarkDeliveryHandedToReceptionHandler(
        IDeliveryBatchRepository repository,
        IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task Handle(
        MarkDeliveryHandedToReceptionCommand command,
        CancellationToken cancellationToken)
    {
        var batch = await _repository.GetByIdAsync(command.BatchId, cancellationToken)
            ?? throw new KeyNotFoundException($"DeliveryBatch {command.BatchId} not found.");

        batch.MarkAsHandedToReception(command.AdminUserId);

        await _repository.SaveChangesAsync(cancellationToken);

        foreach (var evt in batch.DomainEvents)
            await _mediator.Publish(evt, cancellationToken);

        batch.ClearDomainEvents();
    }
}