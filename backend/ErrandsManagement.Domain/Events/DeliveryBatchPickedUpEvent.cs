using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record DeliveryBatchPickedUpEvent(Guid BatchId) : IDomainEvent;