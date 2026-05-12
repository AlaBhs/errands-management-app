using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.UnitTests.Builders;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.CancelRequest;

public class CancelRequestHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock = new();
    private readonly CancelRequestHandler _handler;

    public CancelRequestHandlerTests()
    {
        _handler = new CancelRequestHandler(_repositoryMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Cancel_Request_When_Valid()
    {
        // Arrange
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new CancelRequestCommand(request.Id, "No longer needed", "Admin");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        request.Status.Should().Be(RequestStatus.Cancelled);
        _repositoryMock.Verify(r =>
            r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_Request_Not_Found()
    {
        // Arrange
        _repositoryMock
            .Setup(r => r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Domain.Entities.Request?)null);

        var command = new CancelRequestCommand(Guid.NewGuid(), "Reason", "Admin");

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_Should_Throw_BusinessRuleException_When_Courier_Has_No_Reason()
    {
        // Arrange
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new CancelRequestCommand(request.Id, null, "Courier");

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*reason*");
    }

    [Fact]
    public async Task Handle_Should_Throw_BusinessRuleException_When_Courier_Has_Empty_Reason()
    {
        // Arrange
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new CancelRequestCommand(request.Id, "   ", "Courier");

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("*reason*");
    }

    [Fact]
    public async Task Handle_Should_Cancel_When_Courier_Provides_Reason()
    {
        // Arrange
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new CancelRequestCommand(request.Id, "Vehicle breakdown", "Courier");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        request.Status.Should().Be(RequestStatus.Cancelled);
        _repositoryMock.Verify(r =>
            r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Not_Require_Reason_For_Admin()
    {
        // Arrange
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new CancelRequestCommand(request.Id, null, "Admin");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        request.Status.Should().Be(RequestStatus.Cancelled);
    }

    [Fact]
    public async Task Handle_Should_Not_Require_Reason_For_Collaborator()
    {
        // Arrange
        var request = new RequestBuilder().Build();

        _repositoryMock
            .Setup(r => r.GetByIdAsync(request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var command = new CancelRequestCommand(request.Id, null, "Collaborator");

        // Act
        await _handler.Handle(command, CancellationToken.None);

        // Assert
        request.Status.Should().Be(RequestStatus.Cancelled);
    }

    [Fact]
    public async Task Handle_Should_Not_Call_Repository_When_Courier_Has_No_Reason()
    {
        // Arrange
        var command = new CancelRequestCommand(Guid.NewGuid(), null, "Courier");

        // Act
        Func<Task> act = () => _handler.Handle(command, CancellationToken.None);
        await act.Should().ThrowAsync<BusinessRuleException>();

        // Assert — repository never touched when guard fails
        _repositoryMock.Verify(r =>
            r.GetByIdAsync(It.IsAny<Guid>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }
}