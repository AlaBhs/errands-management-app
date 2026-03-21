using ErrandsManagement.Application.Attachments.Commands.DeleteAttachment;
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Features.Attachments.Commands.DeleteAttachment;

public sealed class DeleteAttachmentHandler : IRequestHandler<DeleteAttachmentCommand>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IFileStorageService _fileStorageService;

    public DeleteAttachmentHandler(
        IRequestRepository requestRepository,
        IFileStorageService fileStorageService)
    {
        _requestRepository = requestRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task Handle(
        DeleteAttachmentCommand command,
        CancellationToken cancellationToken)
    {
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken)
            ?? throw new NotFoundException(
                $"Request {command.RequestId} not found.");

        // Resolve the URI before removing from domain —
        // once removed the attachment is no longer accessible
        var attachment = request.Attachments
            .FirstOrDefault(a => a.Id == command.AttachmentId)
            ?? throw new NotFoundException(
                $"Attachment {command.AttachmentId} not found on request {command.RequestId}.");

        var uriToDelete = attachment.Uri;

        // Remove from domain aggregate
        request.RemoveAttachment(command.AttachmentId);

        // Persist domain change first — if DB save fails, file stays intact
        await _requestRepository.SaveChangesAsync(cancellationToken);

        // Delete from storage after successful DB save —
        // a failed file delete is recoverable (orphaned file),
        // a failed DB save with deleted file is not (data loss)
        await _fileStorageService.DeleteAsync(uriToDelete, cancellationToken);
    }
}