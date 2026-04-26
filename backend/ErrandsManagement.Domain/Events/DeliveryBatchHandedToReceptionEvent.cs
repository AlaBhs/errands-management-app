using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record DeliveryBatchHandedToReceptionEvent(
    Guid BatchId,
    string BatchTitle,
    string ClientName
) : IDomainEvent;