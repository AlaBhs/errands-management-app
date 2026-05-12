using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Application.Requests.Queries.GetMyRequests;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Requests.Queries.GetMyRequests;

public class GetMyRequestsHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock = new();
    private readonly GetMyRequestsHandler _handler;

    public GetMyRequestsHandlerTests()
    {
        _handler = new GetMyRequestsHandler(_repositoryMock.Object);
    }

    private static PagedResult<RequestListItemDto> EmptyPage() =>
        PagedResult<RequestListItemDto>.Create([], 1, 10, 0);

    [Fact]
    public async Task Handle_Should_Return_Paged_Result_From_Repository()
    {
        // Arrange
        var requesterId = Guid.NewGuid();
        var parameters = new RequestQueryParameters { Page = 1, PageSize = 10 };
        var items = new List<RequestListItemDto>
        {
            new(Guid.NewGuid(), "Request 1", "Desc", "Pending",   "Normal", "Other", null, null, false),
            new(Guid.NewGuid(), "Request 2", "Desc", "Assigned",  "High",   "Other", null, null, false),
        };
        var paged = PagedResult<RequestListItemDto>.Create(items, 1, 10, 2);

        _repositoryMock
            .Setup(r => r.GetMyRequestsAsync(requesterId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(paged);

        // Act
        var result = await _handler.Handle(
            new GetMyRequestsQuery(requesterId, parameters), CancellationToken.None);

        // Assert
        result.Items.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
    }

    [Fact]
    public async Task Handle_Should_Delegate_RequesterId_To_Repository()
    {
        // Arrange
        var requesterId = Guid.NewGuid();
        var parameters = new RequestQueryParameters { Page = 1, PageSize = 10 };

        _repositoryMock
            .Setup(r => r.GetMyRequestsAsync(requesterId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmptyPage());

        // Act
        await _handler.Handle(
            new GetMyRequestsQuery(requesterId, parameters), CancellationToken.None);

        // Assert — correct requesterId passed through
        _repositoryMock.Verify(r =>
            r.GetMyRequestsAsync(requesterId, parameters, It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Return_Empty_Page_When_No_Requests()
    {
        // Arrange
        var requesterId = Guid.NewGuid();
        var parameters = new RequestQueryParameters { Page = 1, PageSize = 10 };

        _repositoryMock
            .Setup(r => r.GetMyRequestsAsync(requesterId, parameters, It.IsAny<CancellationToken>()))
            .ReturnsAsync(EmptyPage());

        // Act
        var result = await _handler.Handle(
            new GetMyRequestsQuery(requesterId, parameters), CancellationToken.None);

        // Assert
        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
    }
}