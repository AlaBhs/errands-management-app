using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using FluentAssertions;
using Moq;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.AssignRequest;

public class AssignRequestHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock;
    private readonly AssignRequestHandler _handler;

    public AssignRequestHandlerTests()
    {
        _repositoryMock = new Mock<IRequestRepository>();
        _handler = new AssignRequestHandler(_repositoryMock.Object);
    }

    private static Request CreateRequest()
    {
        return new Request(
            "Laptop purchase",
            "Buy a laptop",
            Guid.NewGuid(),
            new Address("Street", "City", "1000", "TN"),
            PriorityLevel.Normal);
    }

    [Fact]
    public async Task Handle_Should_Assign_Request_When_Request_Exists()
    {
        var request = CreateRequest();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new AssignRequestCommand(request.Id, Guid.NewGuid());

        await _handler.Handle(command, CancellationToken.None);

        request.Status.Should().Be(RequestStatus.Assigned);

        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_When_Request_Not_Found()
    {
        _repositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Request?)null);

        var command = new AssignRequestCommand(Guid.NewGuid(), Guid.NewGuid());

        Func<Task> act = async () =>
            await _handler.Handle(command, CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }
}