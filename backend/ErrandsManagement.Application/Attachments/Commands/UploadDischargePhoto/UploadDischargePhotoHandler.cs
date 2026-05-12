using ErrandsManagement.Application.Attachments.Commands.UploadDischargePhoto;
using ErrandsManagement.Application.Attachments.DTOs;
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Attachments.Commands.UploadDischargePhoto;

public sealed class UploadDischargePhotoHandler
    : IRequestHandler<UploadDischargePhotoCommand, AttachmentDto>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IFileStorageService _fileStorageService;

    public UploadDischargePhotoHandler(
        IRequestRepository requestRepository,
        IFileStorageService fileStorageService)
    {
        _requestRepository = requestRepository;
        _fileStorageService = fileStorageService;
    }

    public async Task<AttachmentDto> Handle(
        UploadDischargePhotoCommand command,
        CancellationToken cancellationToken)
    {
        var request = await _requestRepository
            .GetByIdAsync(command.RequestId, cancellationToken)
            ?? throw new NotFoundException(
                $"Request {command.RequestId} not found.");

        var relativeUri = await _fileStorageService.SaveAsync(
            command.FileStream,
            command.FileName,
            command.ContentType,
            cancellationToken);

        try
        {
            // Domain validates: must be Completed, no existing discharge photo
            request.AddDischargePhoto(
                command.FileName,
                command.ContentType,
                relativeUri);

            await _requestRepository.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            await _fileStorageService.DeleteAsync(relativeUri, cancellationToken);
            throw;
        }

        var attachment = request.Attachments.Last();

        return new AttachmentDto(
            attachment.Id,
            attachment.FileName,
            attachment.ContentType,
            _fileStorageService.GetUrl(attachment.Uri),
            attachment.Type,
            attachment.UploadedAt);
    }
}