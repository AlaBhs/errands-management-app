using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.CreateDeliveryBatch;

public sealed class CreateDeliveryBatchHandler
    : IRequestHandler<CreateDeliveryBatchCommand, Guid>
{
    private readonly IDeliveryBatchRepository _repository;
    private readonly IMediator _mediator;

    public CreateDeliveryBatchHandler(
        IDeliveryBatchRepository repository,
        IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
    }

    public async Task<Guid> Handle(
        CreateDeliveryBatchCommand command,
        CancellationToken cancellationToken)
    {
        var batch = new DeliveryBatch(
            command.Title,
            command.ClientName,
            command.CreatedBy,
            command.ClientPhone,
            command.PickupNote);

        await _repository.AddAsync(batch, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        foreach (var evt in batch.DomainEvents)
            await _mediator.Publish(evt, cancellationToken);

        batch.ClearDomainEvents();

        return batch.Id;
    }
}