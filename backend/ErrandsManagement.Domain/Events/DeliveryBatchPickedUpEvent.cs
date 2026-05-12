using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record DeliveryBatchPickedUpEvent(
    Guid BatchId,
    string BatchTitle,
    string ClientName,
    Guid CreatedBy
) : IDomainEvent;