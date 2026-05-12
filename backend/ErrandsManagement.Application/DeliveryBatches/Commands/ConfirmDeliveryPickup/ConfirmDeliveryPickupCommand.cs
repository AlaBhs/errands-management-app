using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.ConfirmDeliveryPickup;

public sealed record ConfirmDeliveryPickupCommand(
    Guid BatchId,
    Guid ReceptionUserId,
    string? PickedUpBy = null
) : IRequest;