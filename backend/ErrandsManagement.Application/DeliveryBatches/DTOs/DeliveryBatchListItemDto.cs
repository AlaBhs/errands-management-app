namespace ErrandsManagement.Application.DeliveryBatches.DTOs;

public sealed record DeliveryBatchListItemDto(
    Guid Id,
    string Title,
    string ClientName,
    string Status,
    DateTime CreatedAt
);