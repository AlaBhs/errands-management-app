namespace ErrandsManagement.Application.DeliveryBatches.DTOs;

public sealed record DeliveryBatchDto(
    Guid Id,
    string Title,
    string ClientName,
    string? ClientPhone,
    string? PickupNote,
    string Status,

    Guid CreatedBy,
    DateTime CreatedAt,

    DateTime? HandedToReceptionAt,
    Guid? HandedToReceptionBy,

    DateTime? PickedUpAt,
    string? PickedUpBy,
    Guid? ConfirmedBy,

    DateTime? CancelledAt,
    string? CancelReason,

    IReadOnlyCollection<DeliveryBatchAttachmentDto> Attachments
);