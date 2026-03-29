using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record RequestCreatedEvent(
    Guid RequestId,
    string RequestTitle) : IDomainEvent;