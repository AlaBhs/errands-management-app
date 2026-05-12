using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetUserById;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Queries.GetUserById;

public class GetUserByIdHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly GetUserByIdHandler _handler;

    public GetUserByIdHandlerTests()
    {
        _handler = new GetUserByIdHandler(_userRepoMock.Object);
    }

    private static UserListItemDto MakeUser(Guid? id = null) =>
        new(id ?? Guid.NewGuid(), "Test User", "user@test.local", "Collaborator", true, DateTimeOffset.UtcNow);

    [Fact]
    public async Task Handle_Should_Return_User_When_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var userDto = MakeUser(userId);

        _userRepoMock
            .Setup(r => r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(userDto);

        // Act
        var result = await _handler.Handle(new GetUserByIdQuery(userId), CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(userId);
        result.FullName.Should().Be("Test User");
        result.Email.Should().Be("user@test.local");
        result.Role.Should().Be("Collaborator");
        result.IsActive.Should().BeTrue();
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_User_Not_Found()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserListItemDto?)null);

        // Act
        Func<Task> act = () => _handler.Handle(new GetUserByIdQuery(userId), CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>()
            .WithMessage($"*{userId}*");
    }

    [Fact]
    public async Task Handle_Should_Call_Repository_With_Correct_Id()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _userRepoMock
            .Setup(r => r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(MakeUser(userId));

        // Act
        await _handler.Handle(new GetUserByIdQuery(userId), CancellationToken.None);

        // Assert
        _userRepoMock.Verify(r =>
            r.FindListItemByIdAsync(userId, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}