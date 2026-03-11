using ErrandsManagement.Application.Auth.Commands.RegisterUser;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Auth.Commands.RegisterUser;

public class RegisterUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();

    private RegisterUserHandler CreateHandler() => new(_userRepoMock.Object);

    [Fact]
    public async Task Handle_With_New_Email_Should_Create_User_And_Return_AuthResponse()
    {
        _userRepoMock
            .Setup(r => r.FindByEmailAsync("new@test.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        var createdDto = new UserDto(Guid.NewGuid(), "new@test.local", "New User", ["Collaborator"]);
        _userRepoMock
            .SetupSequence(r => r.FindByEmailAsync("new@test.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null)        // first call: existence check
            .ReturnsAsync(createdDto);           // second call: after creation

        var command = new RegisterUserCommand("New User", "new@test.local", "Test1234!", "Collaborator");

        var result = await CreateHandler().Handle(command, CancellationToken.None);

        result.Email.Should().Be("new@test.local");
        result.FullName.Should().Be("New User");
        result.AccessToken.Should().BeEmpty();  // Admin-provisioned — no tokens issued
        result.RefreshToken.Should().BeEmpty();

        _userRepoMock.Verify(r =>
            r.CreateAsync(It.IsAny<UserDto>(), "Test1234!", It.IsAny<CancellationToken>()),
            Times.Once);
        _userRepoMock.Verify(r =>
            r.AssignRoleAsync(It.IsAny<Guid>(), "Collaborator", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_When_Email_Already_Exists_Should_Throw_InvalidOperationException()
    {
        var existingDto = new UserDto(Guid.NewGuid(), "dup@test.local", "Existing", ["Admin"]);
        _userRepoMock
            .Setup(r => r.FindByEmailAsync("dup@test.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingDto);

        var command = new RegisterUserCommand("Dup", "dup@test.local", "Test1234!", "Collaborator");

        Func<Task> act = () => CreateHandler().Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*already exists*");
    }
}