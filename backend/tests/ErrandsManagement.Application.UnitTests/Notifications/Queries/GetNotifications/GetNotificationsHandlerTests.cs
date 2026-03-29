using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Queries.GetNotifications;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Notifications.Queries.GetNotifications;

public class GetNotificationsHandlerTests
{
    private readonly Mock<INotificationRepository> _repositoryMock;
    private readonly GetNotificationsHandler _handler;

    public GetNotificationsHandlerTests()
    {
        _repositoryMock = new Mock<INotificationRepository>();
        _handler = new GetNotificationsHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Notifications_With_Correct_UnreadCount()
    {
        var userId = Guid.NewGuid();

        var notifications = new List<Notification>
        {
            Notification.Create(userId, "First notification", NotificationType.RequestCreated),
            Notification.Create(userId, "Second notification", NotificationType.RequestAssigned),
            Notification.Create(userId, "Third notification", NotificationType.RequestCompleted),
        };

        // Mark one as read
        notifications[2].MarkAsRead();

        _repositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var query = new GetNotificationsQuery(userId);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Notifications.Should().HaveCount(3);
        result.UnreadCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_List_When_No_Notifications()
    {
        var userId = Guid.NewGuid();

        _repositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Notification>());

        var query = new GetNotificationsQuery(userId);

        var result = await _handler.Handle(query, CancellationToken.None);

        result.Notifications.Should().BeEmpty();
        result.UnreadCount.Should().Be(0);
    }

    [Fact]
    public async Task Handle_Should_Map_Notification_Fields_Correctly()
    {
        var userId = Guid.NewGuid();
        var referenceId = Guid.NewGuid();

        var notification = Notification.Create(
            userId,
            "Test message",
            NotificationType.RequestAssigned,
            referenceId);

        _repositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Notification> { notification });

        var query = new GetNotificationsQuery(userId);

        var result = await _handler.Handle(query, CancellationToken.None);

        var dto = result.Notifications.Single();
        dto.Message.Should().Be("Test message");
        dto.Type.Should().Be(NotificationType.RequestAssigned);
        dto.ReferenceId.Should().Be(referenceId);
        dto.IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_Should_Return_Zero_UnreadCount_When_All_Read()
    {
        var userId = Guid.NewGuid();

        var notifications = new List<Notification>
        {
            Notification.Create(userId, "First", NotificationType.RequestCreated),
            Notification.Create(userId, "Second", NotificationType.RequestCompleted),
        };

        notifications.ForEach(n => n.MarkAsRead());

        _repositoryMock
            .Setup(r => r.GetByUserIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        var result = await _handler.Handle(
            new GetNotificationsQuery(userId), CancellationToken.None);

        result.UnreadCount.Should().Be(0);
    }
}