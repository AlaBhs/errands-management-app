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

public class CreateNotificationOnRequestCreatedTests
{
    private readonly Mock<INotificationRepository> _repositoryMock = new();
    private readonly Mock<IUserRepository> _userRepositoryMock = new();
    private readonly Mock<ISystemConfigReader> _configReaderMock = new();
    private readonly Mock<IUserPreferencesRepository> _prefsRepoMock = new();
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly CreateNotificationOnRequestCreated _handler;

    public CreateNotificationOnRequestCreatedTests()
    {
        _configReaderMock
            .Setup(r => r.GetAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(SystemConfigurationEntity.CreateDefault());

        _prefsRepoMock
            .Setup(r => r.GetByUserIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserPreferencesEntity?)null);

        _handler = new CreateNotificationOnRequestCreated(
            _repositoryMock.Object,
            _userRepositoryMock.Object,
            _configReaderMock.Object,
            _prefsRepoMock.Object,
            _mediatorMock.Object);
    }

    private static User CreateAdminUser()
        => new User("Admin User", "admin@test.com", UserRole.Admin);

    [Fact]
    public async Task Handle_Should_Persist_One_Notification_Per_Admin()
    {
        var admins = new List<User> { CreateAdminUser(), CreateAdminUser() };

        _userRepositoryMock
            .Setup(r => r.GetByRoleAsync(UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(admins);

        var domainEvent = new RequestCreatedEvent(Guid.NewGuid(), "New Request");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _repositoryMock.Verify(
            r => r.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()),
            Times.Exactly(2));

        // SaveChangesAsync is called once per recipient inside the loop
        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Exactly(2));
    }

    [Fact]
    public async Task Handle_Should_Publish_NotificationCreatedEvent_For_Each_Admin()
    {
        var admins = new List<User> { CreateAdminUser(), CreateAdminUser(), CreateAdminUser() };

        _userRepositoryMock
            .Setup(r => r.GetByRoleAsync(UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(admins);

        var domainEvent = new RequestCreatedEvent(Guid.NewGuid(), "New Request");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _mediatorMock.Verify(
            m => m.Publish(
                It.IsAny<NotificationCreatedEvent>(),
                It.IsAny<CancellationToken>()),
            Times.Exactly(3));
    }

    [Fact]
    public async Task Handle_Should_Do_Nothing_When_No_Admins_Exist()
    {
        _userRepositoryMock
            .Setup(r => r.GetByRoleAsync(UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User>());

        var domainEvent = new RequestCreatedEvent(Guid.NewGuid(), "New Request");

        await _handler.Handle(domainEvent, CancellationToken.None);

        _repositoryMock.Verify(
            r => r.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()),
            Times.Never);

        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Set_Correct_NotificationType()
    {
        var admin = CreateAdminUser();

        _userRepositoryMock
            .Setup(r => r.GetByRoleAsync(UserRole.Admin, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new List<User> { admin });

        Notification? captured = null;
        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Notification>(), It.IsAny<CancellationToken>()))
            .Callback<Notification, CancellationToken>((n, _) => captured = n);

        await _handler.Handle(
            new RequestCreatedEvent(Guid.NewGuid(), "Test"), CancellationToken.None);

        captured!.Type.Should().Be(NotificationType.RequestCreated);
        captured.UserId.Should().Be(admin.Id);
    }
}