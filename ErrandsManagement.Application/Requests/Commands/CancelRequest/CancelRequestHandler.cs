using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.Application.Requests.Commands.CancelRequest;

public sealed class CancelRequestHandler
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
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken);

        if (request is null)
            throw new NotFoundException("Request to cancel not found.");

        request.Cancel(command.Reason);

        await _requestRepository.SaveChangesAsync(cancellationToken);
    }
}