using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.Queries.GetRequestById;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.UnitTests.Builders;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Requests.Queries.GetRequestById;

public class GetRequestByIdHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock = new();
    private readonly Mock<IUserRepository> _userRepoMock = new();
    private readonly GetRequestByIdHandler _handler;

    public GetRequestByIdHandlerTests()
    {
        _userRepoMock
            .Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Application.DTOs.UserDto?)null);

        _handler = new GetRequestByIdHandler(_repositoryMock.Object, _userRepoMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Return_Null_When_Request_Not_Found()
    {
        _repositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Request?)null);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(Guid.NewGuid()), CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task Handle_Should_Map_Basic_Fields_Correctly()
    {
        var request = new RequestBuilder()
            .WithTitle("Deliver package")
            .WithDescription("Urgent delivery")
            .Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result!.Id.Should().Be(request.Id);
        result.Title.Should().Be("Deliver package");
        result.Description.Should().Be("Urgent delivery");
        result.RequesterId.Should().Be(request.RequesterId);
    }

    [Fact]
    public async Task Handle_Should_Return_Null_CurrentAssignment_When_No_Assignment()
    {
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id), CancellationToken.None);

        result!.CurrentAssignment.Should().BeNull();
    }

    [Fact]
    public async Task Handle_Should_Map_CurrentAssignment_When_Request_Is_Assigned()
    {
        var request = new RequestBuilder().Build();
        var courierId = Guid.NewGuid();
        request.Assign(courierId);

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id), CancellationToken.None);

        result!.CurrentAssignment.Should().NotBeNull();
        result.CurrentAssignment!.CourierId.Should().Be(courierId);
    }

    [Fact]
    public async Task Handle_Should_Return_CurrentAssignment_After_Request_Is_Completed()
    {
        var courierId = Guid.NewGuid();
        var request = new RequestBuilder()
            .WithAssignment(courierId)
            .WithCompleted()
            .Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _userRepoMock
            .Setup(r => r.FindByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((UserDto?)null);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id),
            CancellationToken.None);

        result.Should().NotBeNull();
        result!.CurrentAssignment.Should().NotBeNull();
        result.CurrentAssignment!.CourierId.Should().Be(courierId);
    }

    [Fact]
    public async Task Handle_Should_Include_AuditLogs()
    {
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id), CancellationToken.None);

        result!.AuditLogs.Should().NotBeEmpty();
        result.AuditLogs.Should().Contain(a => a.EventType == "Created");
    }

    [Fact]
    public async Task Handle_Should_Return_Null_Survey_When_Not_Submitted()
    {
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id), CancellationToken.None);

        result!.Survey.Should().BeNull();
    }

    [Fact]
    public async Task Handle_Should_Map_Survey_When_Submitted()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());
        request.Start();
        request.Complete();
        request.SubmitSurvey(5, "Excellent service");

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var result = await _handler.Handle(
            new GetRequestByIdQuery(request.Id), CancellationToken.None);

        result!.Survey.Should().NotBeNull();
        result.Survey!.Rating.Should().Be(5);
        result.Survey.Comment.Should().Be("Excellent service");
    }
}