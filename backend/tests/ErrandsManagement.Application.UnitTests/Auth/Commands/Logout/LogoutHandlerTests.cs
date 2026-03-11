using ErrandsManagement.Application.Auth.Commands.Logout;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Auth.Commands.Logout;

public class LogoutHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();

    private LogoutHandler CreateHandler() => new(_userRepoMock.Object);

    private static UserDto MakeUserDto() =>
        new(Guid.NewGuid(), "user@test.local", "Test User", ["Collaborator"]);

    [Fact]
    public async Task Handle_When_Token_Exists_Should_Revoke_It()
    {
        var userDto = MakeUserDto();
        _userRepoMock
            .Setup(r => r.FindByRefreshTokenAsync("valid-refresh", It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);

        await CreateHandler().Handle(
            new LogoutCommand("valid-refresh"), CancellationToken.None);

        _userRepoMock.Verify(r =>
            r.RevokeRefreshTokenAsync(userDto.Id, "valid-refresh", It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_When_Token_Not_Found_Should_Succeed_Idempotently()
    {
        // Token doesn't exist — logout should still succeed silently
        _userRepoMock
            .Setup(r => r.FindByRefreshTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        Func<Task> act = () =>
            CreateHandler().Handle(new LogoutCommand("ghost-token"), CancellationToken.None);

        await act.Should().NotThrowAsync();

        _userRepoMock.Verify(r =>
            r.RevokeRefreshTokenAsync(It.IsAny<Guid>(), It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}