using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.CreateDeliveryBatch;

public sealed record CreateDeliveryBatchCommand(
    string Title,
    string ClientName,
    Guid CreatedBy,
    string? ClientPhone = null,
    string? PickupNote = null
) : IRequest<Guid>;