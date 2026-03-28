using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record RequestStartedEvent(
    Guid RequestId,
    Guid RequesterId,
    string RequestTitle) : IDomainEvent;