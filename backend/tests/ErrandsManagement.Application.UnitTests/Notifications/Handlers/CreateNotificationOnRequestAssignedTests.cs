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

public class CreateNotificationOnRequestAssignedTests
{
    private readonly Mock<INotificationRepository> _repositoryMock;
    private readonly Mock<IMediator> _mediatorMock;
    private readonly CreateNotificationOnRequestAssigned _handler;

    public CreateNotificationOnRequestAssignedTests()
    {
        _repositoryMock = new Mock<INotificationRepository>();
        _mediatorMock = new Mock<IMediator>();
        _handler = new CreateNotificationOnRequestAssigned(
            _repositoryMock.Object, _mediatorMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Persist_Notification_For_Assigned_Courier()
    {
        var courierId = Guid.NewGuid();
        var domainEvent = new RequestAssignedEvent(Guid.NewGuid(), courierId, "Test Request");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _repositoryMock.Verify(
            r => r.AddAsync(
                It.Is<Notification>(n =>
                    n.UserId == courierId &&
                    n.Type == NotificationType.RequestAssigned &&
                    n.IsRead == false),
                It.IsAny<CancellationToken>()),
            Times.Once);

        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Publish_NotificationCreatedEvent_After_Save()
    {
        var domainEvent = new RequestAssignedEvent(
            Guid.NewGuid(), Guid.NewGuid(), "Test Request");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _mediatorMock.Verify(
            m => m.Publish(
                It.IsAny<NotificationCreatedEvent>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Set_ReferenceId_To_RequestId()
    {
        var requestId = Guid.NewGuid();
        var domainEvent = new RequestAssignedEvent(requestId, Guid.NewGuid(), "Test Request");

        Notification? captured = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .Callback<Notification, CancellationToken>((n, _) => captured = n);

        await _handler.Handle(domainEvent, CancellationToken.None);

        captured.Should().NotBeNull();
        captured!.ReferenceId.Should().Be(requestId);
    }

    [Fact]
    public async Task Handle_Should_Include_RequestTitle_In_Message()
    {
        var domainEvent = new RequestAssignedEvent(
            Guid.NewGuid(), Guid.NewGuid(), "Deliver Package");

        Notification? captured = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .Callback<Notification, CancellationToken>((n, _) => captured = n);

        await _handler.Handle(domainEvent, CancellationToken.None);

        captured!.Message.Should().Contain("Deliver Package");
    }
}