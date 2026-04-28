using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DeliveryBatches.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.DeliveryBatches.Commands.UploadDeliveryPickupProof;

public sealed class UploadDeliveryPickupProofHandler
    : IRequestHandler<UploadDeliveryPickupProofCommand, DeliveryBatchAttachmentDto>
{
    private readonly IDeliveryBatchRepository _repository;
    private readonly IFileStorageService _fileStorage;

    public UploadDeliveryPickupProofHandler(
        IDeliveryBatchRepository repository,
        IFileStorageService fileStorage)
    {
        _repository = repository;
        _fileStorage = fileStorage;
    }

    public async Task<DeliveryBatchAttachmentDto> Handle(
        UploadDeliveryPickupProofCommand command,
        CancellationToken cancellationToken)
    {
        var batch = await _repository.GetByIdAsync(command.BatchId, cancellationToken)
            ?? throw new NotFoundException(
                $"DeliveryBatch {command.BatchId} not found.");

        // Save file first — domain validation happens next.
        // If the domain throws, the orphaned file is cleaned up in the catch.
        var relativeUri = await _fileStorage.SaveAsync(
            command.FileStream,
            command.FileName,
            command.ContentType,
            cancellationToken);

        try
        {
            // Domain enforces: Status must be PickedUp, max 5 attachments
            batch.AddPickupProof(command.FileName, command.ContentType, relativeUri);

            await _repository.SaveChangesAsync(cancellationToken);
        }
        catch
        {
            // Roll back the saved file if domain validation or DB save fails
            await _fileStorage.DeleteAsync(relativeUri, cancellationToken);
            throw;
        }

        var attachment = batch.Attachments.Last();

        return new DeliveryBatchAttachmentDto(
            attachment.Id,
            attachment.FileName,
            attachment.ContentType,
            _fileStorage.GetUrl(attachment.Uri),
            attachment.UploadedAt);
    }
}