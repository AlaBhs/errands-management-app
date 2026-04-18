using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;

using MediatR;

public sealed class CreateRequestHandler
    : IRequestHandler<CreateRequestCommand, Guid>
{
    private readonly IRequestRepository _repository;
    private readonly IMediator _mediator;

    public CreateRequestHandler(IRequestRepository repository, IMediator mediator)
    {
        _repository = repository;
        _mediator = mediator;
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
            command.DeliveryAddress.Note,
            command.DeliveryAddress.Latitude,
            command.DeliveryAddress.Longitude);

        var request = new Request(
            command.Title,
            command.Description,
            command.RequesterId,
            address,
            command.Priority,
            command.Category,
            command.ContactPerson,
            command.ContactPhone,
            command.Comment,
            command.Deadline,
            command.EstimatedCost);

        await _repository.AddAsync(request, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in request.DomainEvents)
            await _mediator.Publish(domainEvent, cancellationToken);

        request.ClearDomainEvents();

        return request.Id;
    }
}