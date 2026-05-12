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

    private static NotificationQueryParameters DefaultParameters() =>
        new() { Page = 1, PageSize = 10 };

    [Fact]
    public async Task Handle_Should_Return_Notifications_With_Correct_UnreadCount()
    {
        var userId = Guid.NewGuid();
        var parameters = DefaultParameters();

        var notifications = new List<Notification>
        {
            Notification.Create(userId, "First", NotificationType.RequestCreated),
            Notification.Create(userId, "Second", NotificationType.RequestAssigned),
            Notification.Create(userId, "Third", NotificationType.RequestCompleted),
        };

        notifications[2].MarkAsRead();

        _repositoryMock
            .Setup(r => r.GetPagedAsync(userId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notifications);

        _repositoryMock
            .Setup(r => r.GetUnreadCountAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(2);

        _repositoryMock
            .Setup(r => r.GetTotalCountAsync(userId, parameters.UnreadOnly, It.IsAny<CancellationToken>()))
            .ReturnsAsync(3);

        var result = await _handler.Handle(
            new GetNotificationsQuery(userId, parameters), CancellationToken.None);

        result.Notifications.Should().HaveCount(3);
        result.UnreadCount.Should().Be(2);
        result.TotalCount.Should().Be(3);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_List_When_No_Notifications()
    {
        var userId = Guid.NewGuid();
        var parameters = DefaultParameters();

        _repositoryMock
            .Setup(r => r.GetPagedAsync(userId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Notification>());

        _repositoryMock
            .Setup(r => r.GetUnreadCountAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _repositoryMock
            .Setup(r => r.GetTotalCountAsync(userId, parameters.UnreadOnly, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        var result = await _handler.Handle(
            new GetNotificationsQuery(userId, parameters), CancellationToken.None);

        result.Notifications.Should().BeEmpty();
        result.UnreadCount.Should().Be(0);
        result.TotalCount.Should().Be(0);
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public async Task Handle_Should_Map_Notification_Fields_Correctly()
    {
        var userId = Guid.NewGuid();
        var referenceId = Guid.NewGuid();
        var parameters = DefaultParameters();

        var notification = Notification.Create(
            userId, "Test message", NotificationType.RequestAssigned, referenceId);

        _repositoryMock
            .Setup(r => r.GetPagedAsync(userId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Notification> { notification });

        _repositoryMock
            .Setup(r => r.GetUnreadCountAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        _repositoryMock
            .Setup(r => r.GetTotalCountAsync(userId, parameters.UnreadOnly, It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        var result = await _handler.Handle(
            new GetNotificationsQuery(userId, parameters), CancellationToken.None);

        var dto = result.Notifications.Single();
        dto.Message.Should().Be("Test message");
        dto.Type.Should().Be(NotificationType.RequestAssigned);
        dto.ReferenceId.Should().Be(referenceId);
        dto.IsRead.Should().BeFalse();
    }

    [Fact]
    public async Task Handle_Should_Calculate_TotalPages_Correctly()
    {
        var userId = Guid.NewGuid();
        var parameters = new NotificationQueryParameters { Page = 1, PageSize = 5 };

        _repositoryMock
            .Setup(r => r.GetPagedAsync(userId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<Notification>());

        _repositoryMock
            .Setup(r => r.GetUnreadCountAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);

        _repositoryMock
            .Setup(r => r.GetTotalCountAsync(userId, parameters.UnreadOnly, It.IsAny<CancellationToken>()))
            .ReturnsAsync(13);

        var result = await _handler.Handle(
            new GetNotificationsQuery(userId, parameters), CancellationToken.None);

        // 13 items / 5 per page = 3 pages (ceil)
        result.TotalPages.Should().Be(3);
        result.PageSize.Should().Be(5);
    }
}