using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Handlers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using FluentAssertions;
using MediatR;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Notifications.Handlers;

public class CreateNotificationOnRequestCompletedTests
{
    private readonly Mock<INotificationRepository> _repositoryMock;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly CreateNotificationOnRequestCompleted _handler;

    public CreateNotificationOnRequestCompletedTests()
    {
        _repositoryMock = new Mock<INotificationRepository>();
        _mediatorMock = new Mock<IMediator>();
        _handler = new CreateNotificationOnRequestCompleted(
            _repositoryMock.Object, _mediatorMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Persist_Notification_For_Requester()
    {
        var requesterId = Guid.NewGuid();
        var domainEvent = new RequestCompletedEvent(
            Guid.NewGuid(), requesterId, "Package Delivery");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _repositoryMock.Verify(
            r => r.AddAsync(
                It.Is<Notification>(n =>
                    n.UserId == requesterId &&
                    n.Type == NotificationType.RequestCompleted),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Publish_NotificationCreatedEvent()
    {
        var domainEvent = new RequestCompletedEvent(
            Guid.NewGuid(), Guid.NewGuid(), "Package Delivery");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _mediatorMock.Verify(
            m => m.Publish(
                It.IsAny<NotificationCreatedEvent>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}