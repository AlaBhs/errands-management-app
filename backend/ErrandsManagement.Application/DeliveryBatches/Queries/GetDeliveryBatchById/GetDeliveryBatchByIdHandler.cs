using ErrandsManagement.Application.DeliveryBatches.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Queries.GetDeliveryBatchById;

public sealed class GetDeliveryBatchByIdHandler
    : IRequestHandler<GetDeliveryBatchByIdQuery, DeliveryBatchDto>
{
    private readonly IDeliveryBatchRepository _repository;

    public GetDeliveryBatchByIdHandler(IDeliveryBatchRepository repository)
        => _repository = repository;

    public async Task<DeliveryBatchDto> Handle(
        GetDeliveryBatchByIdQuery request,
        CancellationToken cancellationToken)
    {
        var batch = await _repository.GetByIdAsync(request.Id, cancellationToken)
            ?? throw new KeyNotFoundException($"DeliveryBatch {request.Id} not found.");

        return new DeliveryBatchDto(
            batch.Id,
            batch.Title,
            batch.ClientName,
            batch.ClientPhone,
            batch.PickupNote,
            batch.Status.ToString(),
            batch.CreatedBy,
            batch.CreatedAt,
            batch.HandedToReceptionAt,
            batch.HandedToReceptionBy,
            batch.PickedUpAt,
            batch.PickedUpBy,
            batch.ConfirmedBy,
            batch.CancelledAt,
            batch.CancelReason);
    }
}