using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.Commands.ChangePassword;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Commands.ChangePassword;

public class ChangePasswordHandlerTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly ChangePasswordHandler _handler;

    public ChangePasswordHandlerTests()
    {
        _handler = new ChangePasswordHandler(_userRepo.Object);
    }

    private static UserDto MakeUser(Guid? id = null)
        => new(id ?? Guid.NewGuid(), "user@x.com", "Test User", ["Courier"], true);

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.GetApplicationUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        Func<Task> act = () => _handler.Handle(
            new ChangePasswordCommand(userId, "Old123!", "New123!", "New123!"),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WhenValid_CallsChangePasswordAsync()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.GetApplicationUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId));

        // Act
        await _handler.Handle(
            new ChangePasswordCommand(userId, "Old123!", "New123!", "New123!"),
            CancellationToken.None);

        // Assert
        _userRepo.Verify(r =>
            r.ChangePasswordAsync(userId, "Old123!", "New123!", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenCurrentPasswordWrong_PropagatesException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.GetApplicationUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId));

        _userRepo
            .Setup(r => r.ChangePasswordAsync(userId, "WrongPass!", It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Incorrect password."));

        // Act
        Func<Task> act = () => _handler.Handle(
            new ChangePasswordCommand(userId, "WrongPass!", "New123!", "New123!"),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Incorrect password*");
    }
}