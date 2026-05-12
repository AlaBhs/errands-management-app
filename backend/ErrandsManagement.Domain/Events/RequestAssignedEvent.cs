using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record RequestAssignedEvent(
    Guid RequestId,
    Guid AssignedUserId,
    string RequestTitle) : IDomainEvent;