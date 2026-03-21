using ErrandsManagement.Application.Attachments.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Attachments.Commands.UploadAttachment;

public sealed record UploadAttachmentCommand(
    Guid RequestId,
    string FileName,
    string ContentType,
    long FileSize,
    Stream FileStream
) : IRequest<AttachmentDto>;