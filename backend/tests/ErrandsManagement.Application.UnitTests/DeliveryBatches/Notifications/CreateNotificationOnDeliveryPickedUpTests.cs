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

public class CreateNotificationOnDeliveryPickedUpTests
{
    private readonly Mock<INotificationRepository> _repoMock = new();
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly CreateNotificationOnDeliveryPickedUp _handler;

    public CreateNotificationOnDeliveryPickedUpTests()
        => _handler = new CreateNotificationOnDeliveryPickedUp(
            _repoMock.Object, _userRepoMock.Object, _mediatorMock.Object);

    private static User MakeAdminUser()
        => new("Admin User", "admin@test.com", UserRole.Admin);

    private static DeliveryBatchPickedUpEvent MakeEvent()
        => new(Guid.NewGuid(), "Report Q1", "Acme Corp", Guid.NewGuid());

    [Fact]
    public async Task Handle_Persists_One_Notification_Per_Admin()
    {
        var admins = new List<User> { MakeAdminUser(), MakeAdminUser() };
        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(admins);

        await _handler.Handle(MakeEvent(), CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(
            It.IsAny<Notification>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Publishes_NotificationCreatedEvent_Per_Admin()
    {
        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User> { MakeAdminUser() });

        await _handler.Handle(MakeEvent(), CancellationToken.None);

        _mediatorMock.Verify(m => m.Publish(
            It.IsAny<NotificationCreatedEvent>(),
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Does_Nothing_When_No_Admins_Exist()
    {
        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>());

        await _handler.Handle(MakeEvent(), CancellationToken.None);

        _repoMock.Verify(r => r.AddAsync(
            It.IsAny<Notification>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task Handle_Sets_Correct_NotificationType_And_ReferenceId()
    {
        var batchId = Guid.NewGuid();
        var evt = new DeliveryBatchPickedUpEvent(
            batchId, "Report Q1", "Acme Corp", Guid.NewGuid());

        _userRepoMock.Setup(r => r.GetByRoleAsync(
                UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User> { MakeAdminUser() });

        Notification? captured = null;
        _repoMock.Setup(r => r.AddAsync(
                It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .Callback<Notification, CancellationToken>((n, _) => captured = n);

        await _handler.Handle(evt, CancellationToken.None);

        captured!.Type.Should().Be(NotificationType.DeliveryPickedUp);
        captured.ReferenceId.Should().Be(batchId);
        captured.Message.Should().Contain("Report Q1");
        captured.Message.Should().Contain("Acme Corp");
    }
}