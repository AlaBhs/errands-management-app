using ErrandsManagement.Domain.Common;

public sealed record RequestMessageCreatedEvent(
    Guid MessageId, Guid RequestId, Guid SenderId,
    string Content, DateTime CreatedAt) : IDomainEvent;