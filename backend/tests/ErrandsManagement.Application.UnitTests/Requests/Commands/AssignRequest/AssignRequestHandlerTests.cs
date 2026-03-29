using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.UnitTests.Builders;
using FluentAssertions;
using MediatR;
using Moq;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.AssignRequest;

public class AssignRequestHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock = new();
    private readonly Mock<IMediator> _mediatorMock = new();
    private readonly AssignRequestHandler _handler;

    public AssignRequestHandlerTests()
    {
        _handler = new AssignRequestHandler(_repositoryMock.Object, _mediatorMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Assign_Request_When_Request_Exists()
    {
        var request = new RequestBuilder().Build();

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

    [Fact]
    public async Task Handle_Should_Publish_Domain_Events_After_Save()
    {
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new AssignRequestCommand(request.Id, Guid.NewGuid());

        await _handler.Handle(command, CancellationToken.None);

        _mediatorMock.Verify(
            m => m.Publish(It.IsAny<INotification>(), It.IsAny<CancellationToken>()),
            Times.AtLeastOnce);
    }
}