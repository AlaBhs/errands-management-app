using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Notifications.Events;
using ErrandsManagement.Application.Notifications.Handlers;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
using FluentAssertions;
using MediatR;
using Moq;

namespace ErrandsManagement.Application.UnitTests.DeliveryBatches.Notifications;

public class CreateNotificationOnDeliveryHandedToReceptionTests
{
    private readonly Mock<INotificationRepository> _repoMock = new();
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly CreateNotificationOnDeliveryHandedToReception _handler;

    public CreateNotificationOnDeliveryHandedToReceptionTests()
        => _handler = new CreateNotificationOnDeliveryHandedToReception(
            _repoMock.Object, _userRepoMock.Object, _mediatorMock.Object);

    private static User MakeReceptionUser()
        => new("Reception User", "reception@test.com", UserRole.Reception);

    private static DeliveryBatchHandedToReceptionEvent MakeEvent()
        => new(Guid.NewGuid(), "Report Q1", "Acme Corp");

    [Fact]
    public async Task Handle_Persists_One_Notification_Per_Reception_User()
    {
        var users = new List<User> { MakeReceptionUser(), MakeReceptionUser() };
        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Reception, It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        await _handler.Handle(MakeEvent(), CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(
            It.IsAny<Notification>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Publishes_NotificationCreatedEvent_Per_User()
    {
        var users = new List<User> { MakeReceptionUser(), MakeReceptionUser(), MakeReceptionUser() };
        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Reception, It.IsAny<CancellationToken>()))
            .ReturnsAsync(users);

        await _handler.Handle(MakeEvent(), CancellationToken.None);

        _mediatorMock.Verify(m => m.Publish(
            It.IsAny<NotificationCreatedEvent>(),
            It.IsAny<CancellationToken>()), Times.Exactly(3));
    }

    [Fact]
    public async Task Handle_Does_Nothing_When_No_Reception_Users_Exist()
    {
        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Reception, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>());

        await _handler.Handle(MakeEvent(), CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(
            It.IsAny<Notification>(), It.IsAny<CancellationToken>()), Times.Never);
        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Sets_Correct_NotificationType_And_ReferenceId()
    {
        var batchId = Guid.NewGuid();
        var evt = new DeliveryBatchHandedToReceptionEvent(batchId, "Report Q1", "Acme");

        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Reception, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User> { MakeReceptionUser() });

        Notification? captured = null;
        _repoMock.Setup(r => r.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .Callback<Notification, CancellationToken>((n, _) => captured = n);

        await _handler.Handle(evt, CancellationToken.None);

        captured!.Type.Should().Be(NotificationType.DeliveryHandedToReception);
        captured.ReferenceId.Should().Be(batchId);
        captured.Message.Should().Contain("Report Q1");
        captured.Message.Should().Contain("Acme");
    }
}