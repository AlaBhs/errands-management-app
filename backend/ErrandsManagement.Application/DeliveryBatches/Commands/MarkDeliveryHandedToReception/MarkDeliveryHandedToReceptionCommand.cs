using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.MarkDeliveryHandedToReception;

public sealed record MarkDeliveryHandedToReceptionCommand(
    Guid BatchId,
    Guid AdminUserId
) : IRequest;