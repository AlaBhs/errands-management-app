using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Common.Exceptions;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.CancelRequest;

public sealed class CancelRequestHandler : IRequestHandler<CancelRequestCommand>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IMediator _mediator;

    public CancelRequestHandler(IRequestRepository requestRepository, IMediator mediator)
    {
        _requestRepository = requestRepository;
        _mediator = mediator;
    }

    public async Task Handle(
        CancelRequestCommand command,
        CancellationToken cancellationToken)
    {
        if (command.CallerRole == "Courier" && string.IsNullOrWhiteSpace(command.Reason))
            throw new BusinessRuleException("Couriers must provide a reason when cancelling a request.");

        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken);

        if (request is null)
            throw new NotFoundException("Request to cancel not found.");

        request.Cancel(command.Reason);

        await _requestRepository.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in request.DomainEvents)
            await _mediator.Publish(domainEvent, cancellationToken);

        request.ClearDomainEvents();
    }
}