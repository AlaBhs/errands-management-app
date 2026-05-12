using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Common.Exceptions;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.CancelRequest;

public sealed class CancelRequestHandler : IRequestHandler<CancelRequestCommand>
{
    private readonly IRequestRepository _requestRepository;

    public CancelRequestHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
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
    }
}