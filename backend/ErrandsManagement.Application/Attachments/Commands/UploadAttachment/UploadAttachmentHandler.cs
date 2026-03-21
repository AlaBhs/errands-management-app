using ErrandsManagement.Application.Attachments.Commands.UploadAttachment;
using ErrandsManagement.Application.Attachments.DTOs;
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Features.Attachments.Commands.UploadAttachment;

public sealed class UploadAttachmentHandler
    : IRequestHandler<UploadAttachmentCommand, AttachmentDto>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IFileStorageService _fileStorageService;

    public UploadAttachmentHandler(
        IRequestRepository requestRepository,
        IFileStorageService fileStorageService)
    {
        _requestRepository = requestRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<AttachmentDto> Handle(
        UploadAttachmentCommand command,
        CancellationToken cancellationToken)
    {
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken)
            ?? throw new NotFoundException(
                $"Request {command.RequestId} not found.");

        // Save file to storage first — domain validation happens next.
        // If domain throws, we clean up the orphaned file.
        var relativeUri = await _fileStorageService.SaveAsync(
            command.FileStream,
            command.FileName,
            command.ContentType,
            cancellationToken);

        try
        {
            request.AddAttachment(
                command.FileName,
                command.ContentType,
                relativeUri);

            await _requestRepository.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Roll back the saved file if domain validation or DB save fails
            await _fileStorageService.DeleteAsync(relativeUri, cancellationToken);
            throw;
        }

        var attachment = request.Attachments.Last();

        return new AttachmentDto(
            attachment.Id,
            attachment.FileName,
            attachment.ContentType,
            _fileStorageService.GetUrl(attachment.Uri),
            attachment.UploadedAt);
    }
}