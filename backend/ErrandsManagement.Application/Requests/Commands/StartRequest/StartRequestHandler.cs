using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.StartRequest;

public sealed class StartRequestHandler
    : IRequestHandler<StartRequestCommand>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IMediator _mediator;

    public StartRequestHandler(IRequestRepository requestRepository, IMediator mediator)
    {
        _requestRepository = requestRepository;
        _mediator = mediator;
    }

    public async Task Handle(
        StartRequestCommand command,
        CancellationToken cancellationToken)
    {
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken);

        if (request is null)
            throw new NotFoundException("Request to start not found.");

        request.Start();

        await _requestRepository.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in request.DomainEvents)
            await _mediator.Publish(domainEvent, cancellationToken);

        request.ClearDomainEvents();
    }
}