using ErrandsManagement.Application.Attachments.DTOs;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.UploadDeliveryPickupProof;

public sealed record UploadDeliveryPickupProofCommand(
    Guid BatchId,
    string FileName,
    string ContentType,
    long FileSize,
    Stream FileStream
) : IRequest<AttachmentDto>;