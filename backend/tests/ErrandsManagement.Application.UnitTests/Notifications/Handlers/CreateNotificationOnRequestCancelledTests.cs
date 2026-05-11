using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Handlers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using FluentAssertions;
using MediatR;
using Moq;

using SystemConfigurationEntity = ErrandsManagement.Domain.Entities.SystemConfiguration;
using UserPreferencesEntity = ErrandsManagement.Domain.Entities.UserPreferences;
namespace ErrandsManagement.Application.UnitTests.Notifications.Handlers;

public class CreateNotificationOnRequestCancelledTests
{
    private readonly Mock<INotificationRepository> _repositoryMock = new();
    private readonly Mock<ISystemConfigReader> _configReaderMock = new();
    private readonly Mock<IUserPreferencesRepository> _prefsRepoMock = new();
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly CreateNotificationOnRequestCancelled _handler;

    public CreateNotificationOnRequestCancelledTests()
    {
        _configReaderMock
            .Setup(r => r.GetAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(SystemConfigurationEntity.CreateDefault());

        _prefsRepoMock
            .Setup(r => r.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserPreferencesEntity?)null);

        _handler = new CreateNotificationOnRequestCancelled(
            _repositoryMock.Object,
            _configReaderMock.Object,
            _prefsRepoMock.Object,
            _mediatorMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Persist_Notification_For_Requester()
    {
        var requesterId = Guid.NewGuid();
        var domainEvent = new RequestCancelledEvent(
            Guid.NewGuid(), requesterId, "Urgent Errand");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _repositoryMock.Verify(
            r => r.AddAsync(
                It.Is<Notification>(n =>
                    n.UserId == requesterId &&
                    n.Type == NotificationType.RequestCancelled),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Publish_NotificationCreatedEvent()
    {
        var domainEvent = new RequestCancelledEvent(
            Guid.NewGuid(), Guid.NewGuid(), "Urgent Errand");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _mediatorMock.Verify(
            m => m.Publish(
                It.IsAny<NotificationCreatedEvent>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}