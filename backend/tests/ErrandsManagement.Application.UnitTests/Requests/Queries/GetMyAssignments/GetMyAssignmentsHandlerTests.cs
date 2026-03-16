using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Application.Requests.Queries.GetMyAssignments;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Requests.Queries.GetMyAssignments;

public class GetMyAssignmentsHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock = new();
    private readonly GetMyAssignmentsHandler _handler;

    public GetMyAssignmentsHandlerTests()
    {
        _handler = new GetMyAssignmentsHandler(_repositoryMock.Object);
    }

    private static PagedResult<RequestListItemDto> EmptyPage() =>
        PagedResult<RequestListItemDto>.Create([], 1, 10, 0);

    [Fact]
    public async Task Handle_Should_Return_Paged_Result_From_Repository()
    {
        // Arrange
        var courierId = Guid.NewGuid();
        var parameters = new RequestQueryParameters { Page = 1, PageSize = 10 };
        var items = new List<RequestListItemDto>
        {
            new(Guid.NewGuid(), "Request 1", "Desc", "Pending",   "Normal", "Other", null, null),
            new(Guid.NewGuid(), "Request 2", "Desc", "Assigned",  "High",   "Other", null, null),
        };
        var paged = PagedResult<RequestListItemDto>.Create(items, 1, 10, 2);

        _repositoryMock
            .Setup(r => r.GetMyAssignmentsAsync(courierId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        // Act
        var result = await _handler.Handle(
            new GetMyAssignmentsQuery(courierId, parameters), CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_Should_Delegate_CourierId_To_Repository()
    {
        // Arrange
        var courierId = Guid.NewGuid();
        var parameters = new RequestQueryParameters { Page = 1, PageSize = 10 };

        _repositoryMock
            .Setup(r => r.GetMyAssignmentsAsync(courierId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmptyPage());

        // Act
        await _handler.Handle(
            new GetMyAssignmentsQuery(courierId, parameters), CancellationToken.None);

        // Assert — correct courierId passed through
        _repositoryMock.Verify(r =>
            r.GetMyAssignmentsAsync(courierId, parameters, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_Page_When_No_Assignments()
    {
        // Arrange
        var courierId = Guid.NewGuid();
        var parameters = new RequestQueryParameters { Page = 1, PageSize = 10 };

        _repositoryMock
            .Setup(r => r.GetMyAssignmentsAsync(courierId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmptyPage());

        // Act
        var result = await _handler.Handle(
            new GetMyAssignmentsQuery(courierId, parameters), CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
}