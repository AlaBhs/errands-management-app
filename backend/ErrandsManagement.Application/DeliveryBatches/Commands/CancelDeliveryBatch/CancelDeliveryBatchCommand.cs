using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.CancelDeliveryBatch;

public sealed record CancelDeliveryBatchCommand(
    Guid BatchId,
    Guid UserId,
    string? Reason = null
) : IRequest;