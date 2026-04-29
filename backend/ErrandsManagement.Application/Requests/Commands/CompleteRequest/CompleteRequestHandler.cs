using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;

public sealed class CompleteRequestHandler : IRequestHandler<CompleteRequestCommand>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IFileStorageService _fileStorageService;
    private readonly IMediator _mediator;

    public CompleteRequestHandler(
        IRequestRepository requestRepository,
        IFileStorageService fileStorageService,
        IMediator mediator)
    {
        _requestRepository = requestRepository;
        _fileStorageService = fileStorageService;
        _mediator = mediator;
    }

    public async Task Handle(CompleteRequestCommand command, CancellationToken cancellationToken)
    {
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken)
            ?? throw new NotFoundException("Request to complete not found.");

        request.Complete(command.Note);

        if (command.DischargePhotoStream is not null &&
            command.DischargePhotoFileName is not null &&
            command.DischargePhotoContentType is not null)
        {
            var uri = await _fileStorageService.SaveAsync(
                command.DischargePhotoStream,
                command.DischargePhotoFileName,
                command.DischargePhotoContentType,
                cancellationToken);

            try
            {
                request.AddDischargePhoto(
                    command.DischargePhotoFileName,
                    command.DischargePhotoContentType,
                    uri);
            }
            catch
            {
                await _fileStorageService.DeleteAsync(uri, cancellationToken);
                throw;
            }
        }

        await _requestRepository.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in request.DomainEvents)
            await _mediator.Publish(domainEvent, cancellationToken);

        request.ClearDomainEvents();
    }
}