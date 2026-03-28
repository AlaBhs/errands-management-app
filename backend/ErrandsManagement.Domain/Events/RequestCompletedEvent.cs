using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record RequestCompletedEvent(
    Guid RequestId,
    Guid RequesterId,
    string RequestTitle) : IDomainEvent;