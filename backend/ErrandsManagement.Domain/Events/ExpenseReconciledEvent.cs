using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record ExpenseReconciledEvent(
    Guid RequestId,
    Guid AssignmentId) : IDomainEvent;