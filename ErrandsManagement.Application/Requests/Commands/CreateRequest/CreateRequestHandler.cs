using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Application.Requests.Commands.CreateRequest;

public sealed class CreateRequestHandler
{
    private readonly IRequestRepository _requestRepository;

    public CreateRequestHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<Guid> Handle(
    CreateRequestCommand command,
    CancellationToken cancellationToken)
    {
        var address = new Address(
            command.Street,
            command.City,
            command.PostalCode,
            command.Country,
            command.Note);

        var request = new Request(
            command.Title,
            command.Description,
            command.RequesterId,
            address,
            command.Priority,
            command.Deadline,
            command.EstimatedCost);

        await _requestRepository.AddAsync(request, cancellationToken);
        await _requestRepository.SaveChangesAsync(cancellationToken);

        return request.Id;
    }
}