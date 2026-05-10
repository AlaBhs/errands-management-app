using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Events;

public sealed record SystemConfigurationUpdatedEvent(string Section, Guid ChangedBy) : IDomainEvent;