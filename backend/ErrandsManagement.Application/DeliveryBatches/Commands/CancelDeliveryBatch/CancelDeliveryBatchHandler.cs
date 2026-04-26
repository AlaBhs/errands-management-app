using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.CancelDeliveryBatch;

public sealed class CancelDeliveryBatchHandler
    : IRequestHandler<CancelDeliveryBatchCommand>
{
    private readonly IDeliveryBatchRepository _repository;
    private readonly IMediator _mediator;

    public CancelDeliveryBatchHandler(
        IDeliveryBatchRepository repository,
        IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task Handle(
        CancelDeliveryBatchCommand command,
        CancellationToken cancellationToken)
    {
        var batch = await _repository.GetByIdAsync(command.BatchId, cancellationToken)
            ?? throw new KeyNotFoundException($"DeliveryBatch {command.BatchId} not found.");

        batch.Cancel(command.UserId, command.Reason);

        await _repository.SaveChangesAsync(cancellationToken);

        foreach (var evt in batch.DomainEvents)
            await _mediator.Publish(evt, cancellationToken);

        batch.ClearDomainEvents();
    }
}