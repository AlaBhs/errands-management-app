using ErrandsManagement.Application.Auth.Commands.RefreshToken;
using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Auth.Commands.RefreshToken;

public class RefreshTokenHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly Mock<IJwtTokenGenerator> _jwtGenMock = new();
    private readonly IOptions<JwtSettings> _jwtOptions =
        Options.Create(new JwtSettings
        {
            Secret = "test-secret",
            Issuer = "test",
            Audience = "test",
            ExpiryMinutes = 15,
            RefreshTokenDays = 7
        });

    private RefreshTokenHandler CreateHandler() =>
        new(_userRepoMock.Object, _jwtGenMock.Object, _jwtOptions);

    private static UserDto MakeUserDto() =>
        new(Guid.NewGuid(), "user@test.local", "Test User", ["Collaborator"], true);

    [Fact]
    public async Task Handle_With_Active_Token_Should_Rotate_And_Return_New_Pair()
    {
        var userDto = MakeUserDto();
        _userRepoMock
            .Setup(r => r.FindByRefreshTokenAsync("old-refresh", It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);
        _userRepoMock
            .Setup(r => r.RefreshTokenIsActiveAsync("old-refresh", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _jwtGenMock
            .Setup(g => g.GenerateAccessToken(userDto.Id, userDto.Email, userDto.FullName, userDto.Roles))
            .Returns("new-access-token");
        _jwtGenMock
            .Setup(g => g.GenerateRefreshToken())
            .Returns("new-refresh-token");

        var command = new RefreshTokenCommand("old-refresh");

        var result = await CreateHandler().Handle(command, CancellationToken.None);

        result.AccessToken.Should().Be("new-access-token");
        result.RefreshToken.Should().Be("new-refresh-token");

        _userRepoMock.Verify(r =>
            r.RevokeRefreshTokenAsync(userDto.Id, "old-refresh", It.IsAny<CancellationToken>()),
            Times.Once);
        _userRepoMock.Verify(r =>
            r.AddRefreshTokenAsync(
                userDto.Id, "new-refresh-token",
                It.IsAny<DateTime>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_When_Token_Not_Found_Should_Throw_Unauthorized()
    {
        _userRepoMock
            .Setup(r => r.FindByRefreshTokenAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        Func<Task> act = () =>
            CreateHandler().Handle(new RefreshTokenCommand("unknown"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid refresh token*");
    }

    [Fact]
    public async Task Handle_When_Token_Is_Revoked_Should_Throw_Unauthorized()
    {
        var userDto = MakeUserDto();
        _userRepoMock
            .Setup(r => r.FindByRefreshTokenAsync("revoked", It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);
        _userRepoMock
            .Setup(r => r.RefreshTokenIsActiveAsync("revoked", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        Func<Task> act = () =>
            CreateHandler().Handle(new RefreshTokenCommand("revoked"), CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*expired or been revoked*");
    }
}