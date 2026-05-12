using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

/// <summary>
/// Raised when a request is detected as at risk of missing its deadline.
/// Published by the Application layer (background job handler)
/// </summary>
public sealed record RequestAtRiskEvent(
    Guid RequestId,
    string Title,
    DateTime Deadline,
    Guid RequesterId,
    Guid? AssignedCourierId) : IDomainEvent;