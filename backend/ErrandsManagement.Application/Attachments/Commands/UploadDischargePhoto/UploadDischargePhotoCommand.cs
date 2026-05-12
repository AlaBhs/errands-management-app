using ErrandsManagement.Application.Attachments.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Attachments.Commands.UploadDischargePhoto;

public sealed record UploadDischargePhotoCommand(
    Guid RequestId,
    string FileName,
    string ContentType,
    long FileSize,
    Stream FileStream
) : IRequest<AttachmentDto>;