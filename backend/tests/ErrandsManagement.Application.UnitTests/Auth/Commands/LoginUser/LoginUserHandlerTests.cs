using ErrandsManagement.Application.Auth.Commands.LoginUser;
using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using FluentAssertions;
using Microsoft.Extensions.Options;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Auth.Commands.LoginUser;

public class LoginUserHandlerTests
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

    private LoginUserHandler CreateHandler() =>
        new(_userRepoMock.Object, _jwtGenMock.Object, _jwtOptions);

    private static UserDto MakeUserDto(string email = "user@test.local") =>
        new(Guid.NewGuid(), email, "Test User", ["Collaborator"]);

    [Fact]
    public async Task Handle_With_Valid_Credentials_Should_Return_AuthResponse()
    {
        // Arrange
        var userDto = MakeUserDto();
        _userRepoMock
            .Setup(r => r.FindByEmailAsync("user@test.local", It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);
        _userRepoMock
            .Setup(r => r.CheckPasswordAsync(userDto.Id, "Password1!", It.IsAny<CancellationToken>()))
            .ReturnsAsync(true);
        _jwtGenMock
            .Setup(g => g.GenerateAccessToken(userDto.Id, userDto.Email, userDto.Roles))
            .Returns("access-token");
        _jwtGenMock
            .Setup(g => g.GenerateRefreshToken())
            .Returns("refresh-token");

        var command = new LoginUserCommand("user@test.local", "Password1!");

        // Act
        var result = await CreateHandler().Handle(command, CancellationToken.None);

        // Assert
        result.AccessToken.Should().Be("access-token");
        result.RefreshToken.Should().Be("refresh-token");
        result.Email.Should().Be("user@test.local");

        _userRepoMock.Verify(r =>
            r.RevokeAllActiveRefreshTokensAsync(userDto.Id, It.IsAny<CancellationToken>()),
            Times.Once);
        _userRepoMock.Verify(r =>
            r.AddRefreshTokenAsync(
                userDto.Id, "refresh-token",
                It.IsAny<DateTime>(),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_When_User_Not_Found_Should_Throw_UnauthorizedAccessException()
    {
        _userRepoMock
            .Setup(r => r.FindByEmailAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        var command = new LoginUserCommand("ghost@test.local", "Password1!");

        Func<Task> act = () => CreateHandler().Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid credentials*");
    }

    [Fact]
    public async Task Handle_When_Password_Wrong_Should_Throw_UnauthorizedAccessException()
    {
        var userDto = MakeUserDto();
        _userRepoMock
            .Setup(r => r.FindByEmailAsync(userDto.Email, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);
        _userRepoMock
            .Setup(r => r.CheckPasswordAsync(userDto.Id, "WrongPass!", It.IsAny<CancellationToken>()))
            .ReturnsAsync(false);

        var command = new LoginUserCommand(userDto.Email, "WrongPass!");

        Func<Task> act = () => CreateHandler().Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("*Invalid credentials*");
    }
}