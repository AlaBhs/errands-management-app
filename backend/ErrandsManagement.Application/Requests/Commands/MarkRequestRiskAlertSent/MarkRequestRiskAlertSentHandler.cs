using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.MarkRequestRiskAlertSent;

public sealed class MarkRequestRiskAlertSentHandler
    : IRequestHandler<MarkRequestRiskAlertSentCommand>
{
    private readonly IRequestRepository _repository;

    public MarkRequestRiskAlertSentHandler(IRequestRepository repository)
        => _repository = repository;

    public async Task Handle(
        MarkRequestRiskAlertSentCommand command,
        CancellationToken cancellationToken)
    {
        var request = await _repository.GetByIdAsync(command.RequestId, cancellationToken)
            ?? throw new NotFoundException($"Request {command.RequestId} not found.");

        request.MarkRiskAlertSent();
        await _repository.SaveChangesAsync(cancellationToken);
    }
}