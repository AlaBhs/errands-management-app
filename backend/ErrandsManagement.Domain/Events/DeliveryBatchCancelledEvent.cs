using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record DeliveryBatchCancelledEvent(Guid BatchId, string? Reason) : IDomainEvent;