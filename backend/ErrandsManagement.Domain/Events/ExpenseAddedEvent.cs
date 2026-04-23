using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record ExpenseAddedEvent(
    Guid RequestId,
    Guid ExpenseRecordId,
    decimal Amount) : IDomainEvent;