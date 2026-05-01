using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.Commands.SetPassword;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Commands.SetPassword;

public class SetPasswordHandlerTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly SetPasswordHandler _handler;

    public SetPasswordHandlerTests()
    {
        _handler = new SetPasswordHandler(_userRepo.Object);
    }

    private static UserDto MakeUser(Guid? id = null)
        => new(id ?? Guid.NewGuid(), "user@x.com", "Test User", ["Courier"], true);

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        _userRepo
            .Setup(r => r.FindByEmailAsync("unknown@x.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        Func<Task> act = () => _handler.Handle(
            new SetPasswordCommand("unknown@x.com", "token", "Pass123!", "Pass123!"),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WhenValid_CallsSetPasswordAsync()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.FindByEmailAsync("user@x.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId));

        // Act
        await _handler.Handle(
            new SetPasswordCommand("user@x.com", "valid-token", "Pass123!", "Pass123!"),
            CancellationToken.None);

        // Assert
        _userRepo.Verify(r =>
            r.SetPasswordAsync(userId, "valid-token", "Pass123!", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenTokenInvalid_PropagatesException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.FindByEmailAsync("user@x.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId));

        _userRepo
            .Setup(r => r.SetPasswordAsync(userId, "bad-token", It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("Invalid token."));

        // Act
        Func<Task> act = () => _handler.Handle(
            new SetPasswordCommand("user@x.com", "bad-token", "Pass123!", "Pass123!"),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*Invalid token*");
    }
}