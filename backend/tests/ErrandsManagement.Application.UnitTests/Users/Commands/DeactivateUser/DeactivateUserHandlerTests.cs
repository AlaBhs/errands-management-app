using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.Commands.DeactivateUser;
using ErrandsManagement.Domain.Common.Exceptions;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Commands.DeactivateUser;

public class DeactivateUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly DeactivateUserHandler _handler;

    public DeactivateUserHandlerTests()
    {
        _handler = new DeactivateUserHandler(_userRepoMock.Object);
    }

    private static UserDto MakeUser(Guid? id = null, bool isActive = true) =>
        new(id ?? Guid.NewGuid(), "user@test.local", "Test User", ["Admin"], isActive);

    [Fact]
    public async Task Handle_Should_Deactivate_User_When_Valid()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var requestingUserId = Guid.NewGuid();
        var userDto = MakeUser(userId, isActive: true);

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);

        var command = new DeactivateUserCommand(userId, requestingUserId);

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        _userRepoMock.Verify(r =>
            r.SetIsActiveAsync(userId, false, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_BusinessRuleException_When_Deactivating_Own_Account()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new DeactivateUserCommand(userId, userId); // same ID

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*own account*");
    }

    [Fact]
    public async Task Handle_Should_Not_Call_Repository_When_Self_Deactivation()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var command = new DeactivateUserCommand(userId, userId);

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BusinessRuleException>();

        // Assert — repository should never be touched
        _userRepoMock.Verify(r =>
            r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
        _userRepoMock.Verify(r =>
            r.SetIsActiveAsync(It.IsAny<Guid>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_User_Not_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var requestingUserId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        var command = new DeactivateUserCommand(userId, requestingUserId);

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{userId}*");
    }

    [Fact]
    public async Task Handle_Should_Throw_BusinessRuleException_When_User_Already_Inactive()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var requestingUserId = Guid.NewGuid();
        var inactiveUser = MakeUser(userId, isActive: false);

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(inactiveUser);

        var command = new DeactivateUserCommand(userId, requestingUserId);

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*already inactive*");
    }

    [Fact]
    public async Task Handle_Should_Not_Call_SetIsActive_When_User_Already_Inactive()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var inactiveUser = MakeUser(userId, isActive: false);

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(inactiveUser);

        var command = new DeactivateUserCommand(userId, Guid.NewGuid());

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BusinessRuleException>();

        // Assert
        _userRepoMock.Verify(r =>
            r.SetIsActiveAsync(It.IsAny<Guid>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}