using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Entities;

namespace ErrandsManagement.Application.Notifications.Events;

/// <summary>
/// Internal application event: fired AFTER a notification is persisted.
/// Each delivery channel subscribes independently.
/// </summary>
public sealed record NotificationCreatedEvent(Notification Notification) : IDomainEvent;