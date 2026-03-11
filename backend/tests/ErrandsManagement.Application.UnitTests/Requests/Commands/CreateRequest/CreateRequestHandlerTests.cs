using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.CreateRequest;

public class CreateRequestHandlerTests
{
    private readonly Mock<IRequestRepository> _repositoryMock = new();
    private readonly CreateRequestHandler _handler;

    public CreateRequestHandlerTests()
    {
        _handler = new CreateRequestHandler(_repositoryMock.Object);
    }

    private static CreateRequestCommand ValidCommand(Guid? requesterId = null) =>
        new(
            Title: "Buy groceries",
            Description: "Milk, bread and eggs",
            DeliveryAddress: new AddressDto("Main Street", "City", "12345", "Country"),
            Priority: PriorityLevel.Normal,
            Deadline: DateTime.UtcNow.AddDays(1),
            EstimatedCost: 50,
            RequesterId: requesterId ?? Guid.NewGuid());

    [Fact]
    public async Task Handle_Should_Return_NonEmpty_Guid()
    {
        var command = ValidCommand();

        var result = await _handler.Handle(command, CancellationToken.None);

        result.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task Handle_Should_Call_AddAsync_And_SaveChangesAsync()
    {
        var command = ValidCommand();

        await _handler.Handle(command, CancellationToken.None);

        _repositoryMock.Verify(
            r => r.AddAsync(It.IsAny<Request>(), It.IsAny<CancellationToken>()),
            Times.Once);

        _repositoryMock.Verify(
            r => r.SaveChangesAsync(It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Map_RequesterId_From_Command()
    {
        var requesterId = Guid.NewGuid();
        var command = ValidCommand(requesterId);
        Request? captured = null;

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Request>(), It.IsAny<CancellationToken>()))
            .Callback<Request, CancellationToken>((r, _) => captured = r);

        await _handler.Handle(command, CancellationToken.None);

        captured.Should().NotBeNull();
        captured!.RequesterId.Should().Be(requesterId);
    }

    [Fact]
    public async Task Handle_Should_Map_Address_Fields_From_Command()
    {
        var command = ValidCommand();
        Request? captured = null;

        _repositoryMock
            .Setup(r => r.AddAsync(It.IsAny<Request>(), It.IsAny<CancellationToken>()))
            .Callback<Request, CancellationToken>((r, _) => captured = r);

        await _handler.Handle(command, CancellationToken.None);

        captured!.DeliveryAddress.Street.Should().Be("Main Street");
        captured.DeliveryAddress.City.Should().Be("City");
        captured.DeliveryAddress.PostalCode.Should().Be("12345");
        captured.DeliveryAddress.Country.Should().Be("Country");
    }
}