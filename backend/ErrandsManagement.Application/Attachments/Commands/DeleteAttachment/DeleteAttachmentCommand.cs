using MediatR;

namespace ErrandsManagement.Application.Attachments.Commands.DeleteAttachment;

public sealed record DeleteAttachmentCommand(
    Guid RequestId,
    Guid AttachmentId
) : IRequest;