using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record RequestCancelledEvent(
    Guid RequestId,
    Guid RequesterId,
    string RequestTitle) : IDomainEvent;