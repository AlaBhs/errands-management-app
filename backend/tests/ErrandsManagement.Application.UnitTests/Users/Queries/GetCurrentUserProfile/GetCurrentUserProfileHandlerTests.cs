using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetCurrentUserProfile;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Queries.GetCurrentUserProfile;

public class GetCurrentUserProfileHandlerTests
{
    private readonly Mock<IUserRepository> _userRepo = new();
    private readonly GetCurrentUserProfileHandler _handler;

    public GetCurrentUserProfileHandlerTests()
    {
        _handler = new GetCurrentUserProfileHandler(_userRepo.Object);
    }

    private static UserListItemDto MakeListItem(Guid id)
        => new(id, "Test User", "user@x.com", "Courier", true, DateTimeOffset.UtcNow);

    private static UserDto MakeUserDto(Guid id, string? photoUrl = null)
        => new(id, "user@x.com", "Test User", ["Courier"], true,
               null, null, null, photoUrl);

    [Fact]
    public async Task Handle_WhenUserNotFound_ThrowsNotFoundException()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserListItemDto?)null);

        // Act
        Func<Task> act = () => _handler.Handle(
            new GetCurrentUserProfileQuery(userId),
            CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_WhenFound_ReturnsMappedProfileDto()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeListItem(userId));

        _userRepo
            .Setup(r => r.GetApplicationUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUserDto(userId, "https://example.com/photo.jpg"));

        // Act
        var result = await _handler.Handle(
            new GetCurrentUserProfileQuery(userId),
            CancellationToken.None);

        // Assert
        result.Id.Should().Be(userId);
        result.FullName.Should().Be("Test User");
        result.Email.Should().Be("user@x.com");
        result.Role.Should().Be("Courier");
        result.ProfilePhotoUrl.Should().Be("https://example.com/photo.jpg");
    }

    [Fact]
    public async Task Handle_WhenNoPhoto_ProfilePhotoUrlIsNull()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _userRepo
            .Setup(r => r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeListItem(userId));

        _userRepo
            .Setup(r => r.GetApplicationUserAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUserDto(userId, null));

        // Act
        var result = await _handler.Handle(
            new GetCurrentUserProfileQuery(userId),
            CancellationToken.None);

        // Assert
        result.ProfilePhotoUrl.Should().BeNull();
    }
}