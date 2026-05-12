using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Handlers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Notifications.Handlers;

public class SendRealtimeOnNotificationCreatedTests
{
    private readonly Mock<INotificationRealtimeService> _realtimeServiceMock;
    private readonly SendRealtimeOnNotificationCreated _handler;

    public SendRealtimeOnNotificationCreatedTests()
    {
        _realtimeServiceMock = new Mock<INotificationRealtimeService>();
        _handler = new SendRealtimeOnNotificationCreated(_realtimeServiceMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Send_To_Correct_User()
    {
        var userId = Guid.NewGuid();
        var notification = Notification.Create(
            userId, "Test message", NotificationType.RequestAssigned);

        var domainEvent = new NotificationCreatedEvent(notification);

        await _handler.Handle(domainEvent, CancellationToken.None);

        _realtimeServiceMock.Verify(
            s => s.SendToUserAsync(
                userId,
                notification,
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Call_Realtime_Service_Exactly_Once()
    {
        var notification = Notification.Create(
            Guid.NewGuid(), "Test", NotificationType.RequestCreated);

        var domainEvent = new NotificationCreatedEvent(notification);

        await _handler.Handle(domainEvent, CancellationToken.None);

        _realtimeServiceMock.Verify(
            s => s.SendToUserAsync(
                It.IsAny<Guid>(),
                It.IsAny<Notification>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}