using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;

public sealed class CompleteRequestHandler
{
    private readonly IRequestRepository _requestRepository;

    public CompleteRequestHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task Handle(
        CompleteRequestCommand command,
        CancellationToken cancellationToken)
    {
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken);

        if (request is null)
            throw new NotFoundException("Request to complete not found.");

        request.Complete(command.ActualCost, command.Note);

        await _requestRepository.SaveChangesAsync(cancellationToken);
    }
}