using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.Commands.CreateUser;
using ErrandsManagement.Application.Users.Commands.SendActivationEmail;
using FluentAssertions;
using MediatR;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Commands.CreateUser;

public class CreateUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly Mock<ISender> _mediator = new();
    private readonly CreateUserHandler _handler;

    public CreateUserHandlerTests()
    {
        _handler = new CreateUserHandler(_userRepo.Object, _mediator.Object);
    }

    private static UserDto MakeUser(string email = "x@x.com")
        => new(Guid.NewGuid(), email, "Test User", ["Courier"], true);

    [Fact]
    public async Task Handle_WhenEmailAlreadyExists_ThrowsConflictException()
    {
        // Arrange
        _userRepo
            .Setup(r => r.FindByEmailAsync("x@x.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser());

        // Act
        Func<Task> act = () => _handler.Handle(
            new CreateUserCommand("Name", "x@x.com", "Courier"),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<ConflictException>()
            .WithMessage("*x@x.com*");
    }

    [Fact]
    public async Task Handle_WhenValid_CreatesUserWithoutPassword()
    {
        // Arrange
        _userRepo
            .Setup(r => r.FindByEmailAsync("new@x.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        await _handler.Handle(
            new CreateUserCommand("New User", "new@x.com", "Courier"),
            CancellationToken.None);

        // Assert
        _userRepo.Verify(r =>
            r.CreateWithoutPasswordAsync(
                It.Is<UserDto>(d => d.Email == "new@x.com"),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValid_AssignsRole()
    {
        // Arrange
        _userRepo
            .Setup(r => r.FindByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        await _handler.Handle(
            new CreateUserCommand("New User", "new@x.com", "Courier"),
            CancellationToken.None);

        // Assert
        _userRepo.Verify(r =>
            r.AssignRoleAsync(It.IsAny<Guid>(), "Courier", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValid_SendsActivationEmail()
    {
        // Arrange
        _userRepo
            .Setup(r => r.FindByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        await _handler.Handle(
            new CreateUserCommand("New User", "new@x.com", "Courier"),
            CancellationToken.None);

        // Assert
        _mediator.Verify(m =>
            m.Send(
                It.Is<SendActivationEmailCommand>(c => c.Email == "new@x.com"),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_WhenValid_ReturnsNewGuid()
    {
        // Arrange
        _userRepo
            .Setup(r => r.FindByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        // Act
        var result = await _handler.Handle(
            new CreateUserCommand("New User", "new@x.com", "Courier"),
            CancellationToken.None);

        // Assert
        result.Should().NotBeEmpty();
    }
}