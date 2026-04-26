using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record DeliveryBatchCreatedEvent(Guid BatchId) : IDomainEvent;