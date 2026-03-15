using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using ErrandsManagement.Application.Users.Queries.GetAllUsers;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Users.Queries.GetAllUsers;

public class GetAllUsersHandlerTests
{
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly GetAllUsersHandler _handler;

    public GetAllUsersHandlerTests()
    {
        _handler = new GetAllUsersHandler(_userRepoMock.Object);
    }

    private static UserListItemDto MakeUser(string fullName = "Test User") =>
        new(Guid.NewGuid(), fullName, "user@test.local", "Collaborator", true, DateTimeOffset.UtcNow);

    [Fact]
    public async Task Handle_Should_Return_Paged_Result_From_Repository()
    {
        // Arrange
        var parameters = new UserQueryParameters { Page = 1, PageSize = 10 };
        var items = new List<UserListItemDto> { MakeUser("Alice"), MakeUser("Bob") };
        var paged = PagedResult<UserListItemDto>.Create(items, 1, 10, 2);

        _userRepoMock
            .Setup(r => r.GetPagedAsync(parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        var query = new GetAllUsersQuery(parameters);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
    }

    [Fact]
    public async Task Handle_Should_Delegate_Parameters_To_Repository()
    {
        // Arrange
        var parameters = new UserQueryParameters
        {
            Page = 2,
            PageSize = 5,
            Role = "Admin",
            Search = "john"
        };

        var paged = PagedResult<UserListItemDto>.Create([], 2, 5, 0);

        _userRepoMock
            .Setup(r => r.GetPagedAsync(parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        var query = new GetAllUsersQuery(parameters);

        // Act
        await _handler.Handle(query, CancellationToken.None);

        // Assert — parameters passed through unchanged
        _userRepoMock.Verify(r =>
            r.GetPagedAsync(parameters, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_Page_When_No_Users_Match()
    {
        // Arrange
        var parameters = new UserQueryParameters { Page = 1, PageSize = 10, Search = "nonexistent" };
        var paged = PagedResult<UserListItemDto>.Create([], 1, 10, 0);

        _userRepoMock
            .Setup(r => r.GetPagedAsync(parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        // Act
        var result = await _handler.Handle(new GetAllUsersQuery(parameters), CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
    [Fact]
    public async Task Handle_Should_Pass_IsActive_Filter_To_Repository()
    {
        // Arrange
        var parameters = new UserQueryParameters { Page = 1, PageSize = 10, IsActive = false };
        var paged = PagedResult<UserListItemDto>.Create([], 1, 10, 0);

        _userRepoMock
            .Setup(r => r.GetPagedAsync(parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        // Act
        await _handler.Handle(new GetAllUsersQuery(parameters), CancellationToken.None);

        // Assert
        _userRepoMock.Verify(r =>
            r.GetPagedAsync(
                It.Is<UserQueryParameters>(p => p.IsActive == false),
                It.IsAny<CancellationToken>()),
            Times.Once);
    }
}