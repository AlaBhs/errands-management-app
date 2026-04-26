using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.ConfirmDeliveryPickup;

public sealed class ConfirmDeliveryPickupHandler
    : IRequestHandler<ConfirmDeliveryPickupCommand>
{
    private readonly IDeliveryBatchRepository _repository;
    private readonly IMediator _mediator;

    public ConfirmDeliveryPickupHandler(
        IDeliveryBatchRepository repository,
        IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task Handle(
        ConfirmDeliveryPickupCommand command,
        CancellationToken cancellationToken)
    {
        var batch = await _repository.GetByIdAsync(command.BatchId, cancellationToken)
            ?? throw new KeyNotFoundException($"DeliveryBatch {command.BatchId} not found.");

        batch.ConfirmPickup(command.ReceptionUserId, command.PickedUpBy);

        await _repository.SaveChangesAsync(cancellationToken);

        foreach (var evt in batch.DomainEvents)
            await _mediator.Publish(evt, cancellationToken);

        batch.ClearDomainEvents();
    }
}