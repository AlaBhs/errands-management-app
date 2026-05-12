using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.Commands.ActivateUser;
using ErrandsManagement.Domain.Common.Exceptions;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Commands.ActivateUser;

public class ActivateUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly ActivateUserHandler _handler;

    public ActivateUserHandlerTests()
    {
        _handler = new ActivateUserHandler(_userRepoMock.Object);
    }

    private static UserDto MakeUser(Guid? id = null, bool isActive = false) =>
        new(id ?? Guid.NewGuid(), "user@test.local", "Test User", ["Collaborator"], isActive);

    [Fact]
    public async Task Handle_Should_Activate_User_When_Valid()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId, isActive: false));

        // Act
        await _handler.Handle(new ActivateUserCommand(userId), CancellationToken.None);

        // Assert
        _userRepoMock.Verify(r =>
            r.SetIsActiveAsync(userId, true, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_User_Not_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        Func<Task> act = () =>
            _handler.Handle(new ActivateUserCommand(userId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{userId}*");
    }

    [Fact]
    public async Task Handle_Should_Throw_BusinessRuleException_When_Already_Active()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId, isActive: true));

        // Act
        Func<Task> act = () =>
            _handler.Handle(new ActivateUserCommand(userId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*already active*");
    }

    [Fact]
    public async Task Handle_Should_Not_Call_SetIsActive_When_Already_Active()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId, isActive: true));

        // Act
        Func<Task> act = () =>
            _handler.Handle(new ActivateUserCommand(userId), CancellationToken.None);
        await act.Should().ThrowAsync<BusinessRuleException>();

        // Assert
        _userRepoMock.Verify(r =>
            r.SetIsActiveAsync(It.IsAny<Guid>(), It.IsAny<bool>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}