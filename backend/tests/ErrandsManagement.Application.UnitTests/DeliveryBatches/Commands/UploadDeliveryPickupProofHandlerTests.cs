using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DeliveryBatches.Commands.UploadDeliveryPickupProof;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Entities;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.DeliveryBatches.Commands;

public class UploadDeliveryPickupProofHandlerTests
{
    private readonly Mock<IDeliveryBatchRepository> _repoMock = new();
    private readonly Mock<IFileStorageService> _storageMock = new();
    private readonly UploadDeliveryPickupProofHandler _handler;

    public UploadDeliveryPickupProofHandlerTests()
        => _handler = new UploadDeliveryPickupProofHandler(
            _repoMock.Object, _storageMock.Object);

    private static DeliveryBatch MakePickedUpBatch()
    {
        var batch = new DeliveryBatch("Report Q1", "Acme Corp", Guid.NewGuid());
        batch.MarkAsHandedToReception(Guid.NewGuid());
        batch.ConfirmPickup(Guid.NewGuid(), "John Doe");
        return batch;
    }

    private UploadDeliveryPickupProofCommand ValidCommand(Guid batchId) =>
        new(batchId, "proof.jpg", "image/jpeg", 1024, Stream.Null);

    [Fact]
    public async Task Handle_Should_Save_File_And_Return_AttachmentDto()
    {
        var batch = MakePickedUpBatch();
        var uri = "/uploads/proof.jpg";

        _repoMock.Setup(r => r.GetByIdAsync(batch.Id, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(batch);
        _storageMock.Setup(s => s.SaveAsync(
                It.IsAny<Stream>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(uri);
        _storageMock.Setup(s => s.GetUrl(uri)).Returns(uri);

        var result = await _handler.Handle(ValidCommand(batch.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result.FileName.Should().Be("proof.jpg");
        _storageMock.Verify(s => s.SaveAsync(
            It.IsAny<Stream>(), "proof.jpg", "image/jpeg",
            It.IsAny<CancellationToken>()), Times.Once);
        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_Batch_Not_Found_Throws_NotFoundException()
    {
        _repoMock.Setup(r => r.GetByIdAsync(
                It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((DeliveryBatch?)null);

        var act = () => _handler.Handle(
            ValidCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();
    }

    [Fact]
    public async Task Handle_Batch_Not_PickedUp_Throws_And_Deletes_Orphaned_File()
    {
        var batch = new DeliveryBatch("Title", "Client", Guid.NewGuid());
        var uri = "/uploads/proof.jpg";

        _repoMock.Setup(r => r.GetByIdAsync(batch.Id, It.IsAny<CancellationToken>()))
                 .ReturnsAsync(batch);
        _storageMock.Setup(s => s.SaveAsync(
                It.IsAny<Stream>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(uri);

        var act = () => _handler.Handle(ValidCommand(batch.Id), CancellationToken.None);

        await act.Should().ThrowAsync<InvalidRequestStateException>();

        // Orphaned file must be cleaned up
        _storageMock.Verify(s => s.DeleteAsync(uri, It.IsAny<CancellationToken>()), Times.Once);
    }
}