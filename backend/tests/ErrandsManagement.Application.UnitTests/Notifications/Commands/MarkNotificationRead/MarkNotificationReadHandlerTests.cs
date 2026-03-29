using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Commands.MarkNotificationRead;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Notifications.Commands.MarkNotificationRead;

public class MarkNotificationReadHandlerTests
{
    private readonly Mock<INotificationRepository> _repositoryMock;
    private readonly MarkNotificationReadHandler _handler;

    public MarkNotificationReadHandlerTests()
    {
        _repositoryMock = new Mock<INotificationRepository>();
        _handler = new MarkNotificationReadHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Mark_Notification_As_Read()
    {
        var userId = Guid.NewGuid();
        var notification = Notification.Create(
            userId, "Test", NotificationType.RequestCreated);

        _repositoryMock
            .Setup(r => r.GetByIdAsync(notification.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notification);

        var command = new MarkNotificationReadCommand(notification.Id, userId);

        await _handler.Handle(command, CancellationToken.None);

        notification.IsRead.Should().BeTrue();
        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_Notification_Not_Found()
    {
        _repositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Notification?)null);

        var command = new MarkNotificationReadCommand(Guid.NewGuid(), Guid.NewGuid());

        Func<Task> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_Should_Throw_When_Notification_Belongs_To_Different_User()
    {
        var ownerId = Guid.NewGuid();
        var differentUserId = Guid.NewGuid();

        var notification = Notification.Create(
            ownerId, "Test", NotificationType.RequestCreated);

        _repositoryMock
            .Setup(r => r.GetByIdAsync(notification.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notification);

        var command = new MarkNotificationReadCommand(notification.Id, differentUserId);

        Func<Task> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task Handle_Should_Not_Throw_When_Already_Read()
    {
        var userId = Guid.NewGuid();
        var notification = Notification.Create(
            userId, "Test", NotificationType.RequestCreated);

        notification.MarkAsRead();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(notification.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(notification);

        var command = new MarkNotificationReadCommand(notification.Id, userId);

        Func<Task> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

        await act.Should().NotThrowAsync();
        notification.IsRead.Should().BeTrue();
    }
}