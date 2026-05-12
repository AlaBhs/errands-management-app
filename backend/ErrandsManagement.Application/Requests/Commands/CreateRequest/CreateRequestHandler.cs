using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;

using MediatR;

public sealed class CreateRequestHandler
    : IRequestHandler<CreateRequestCommand, Guid>
{
    private readonly IRequestRepository _repository;

    public CreateRequestHandler(IRequestRepository repository)
    {
        _repository = repository;
    }

    public async Task<Guid> Handle(
        CreateRequestCommand command,
        CancellationToken cancellationToken)
    {
        var address = new Address(
            command.DeliveryAddress.Street,
            command.DeliveryAddress.City,
            command.DeliveryAddress.PostalCode,
            command.DeliveryAddress.Country,
            command.DeliveryAddress.Note);

        var request = new Request(
            command.Title,
            command.Description,
            command.RequesterId,
            address,
            command.Priority,
            command.Deadline,
            command.EstimatedCost);

        await _repository.AddAsync(request, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        return request.Id;
    }
}