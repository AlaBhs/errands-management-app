using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.StartRequest;

public sealed class StartRequestHandler
    : IRequestHandler<StartRequestCommand>
{
    private readonly IRequestRepository _requestRepository;

    public StartRequestHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
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
    }
}