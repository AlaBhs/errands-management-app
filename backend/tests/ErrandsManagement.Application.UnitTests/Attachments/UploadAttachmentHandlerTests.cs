using ErrandsManagement.Application.Attachments.Commands.UploadAttachment;
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Features.Attachments.Commands.UploadAttachment;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Attachments;

public class UploadAttachmentHandlerTests
{
    private readonly Mock<IRequestRepository> _repoMock = new();
    private readonly Mock<IFileStorageService> _storageMock = new();
    private readonly UploadAttachmentHandler _handler;

    private static readonly Address DefaultAddress =
        new("Street", "City", "1000", "Tunisia");

    public UploadAttachmentHandlerTests()
    {
        _handler = new UploadAttachmentHandler(
            _repoMock.Object,
            _storageMock.Object);
    }

    private static Request MakeRequest()
    {
        var r = new Request(
            "Title", "Description", Guid.NewGuid(),
            DefaultAddress, PriorityLevel.Normal,
            RequestCategory.Other);
        return r;
    }

    private UploadAttachmentCommand ValidCommand(Guid requestId) =>
        new(
            RequestId: requestId,
            FileName: "document.pdf",
            ContentType: "application/pdf",
            FileSize: 1024,
            FileStream: Stream.Null);

    [Fact]
    public async Task Handle_Should_Save_File_And_Return_AttachmentDto()
    {
        var request = MakeRequest();
        var relativeUri = "/uploads/2026/03/21/file.pdf";

        _repoMock.Setup(r => r.GetByIdAsync(
                request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _storageMock.Setup(s => s.SaveAsync(
                It.IsAny<Stream>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(relativeUri);

        _storageMock.Setup(s => s.GetUrl(relativeUri))
            .Returns(relativeUri);

        var result = await _handler.Handle(
            ValidCommand(request.Id), CancellationToken.None);

        result.Should().NotBeNull();
        result.FileName.Should().Be("document.pdf");
        result.Uri.Should().Be(relativeUri);

        _storageMock.Verify(s => s.SaveAsync(
            It.IsAny<Stream>(), "document.pdf",
            "application/pdf", It.IsAny<CancellationToken>()),
            Times.Once);

        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_Request_Not_Found()
    {
        _repoMock.Setup(r => r.GetByIdAsync(
                It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Request?)null);

        var act = async () => await _handler.Handle(
            ValidCommand(Guid.NewGuid()), CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();

        _storageMock.Verify(s => s.SaveAsync(
            It.IsAny<Stream>(), It.IsAny<string>(),
            It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Delete_File_When_Domain_Throws()
    {
        // Arrange — request already has 5 attachments (domain will throw)
        var request = MakeRequest();
        for (var i = 0; i < 5; i++)
            request.AddAttachment(
                $"f{i}.pdf", "application/pdf", $"/uploads/f{i}.pdf");

        var savedUri = "/uploads/2026/03/21/extra.pdf";

        _repoMock.Setup(r => r.GetByIdAsync(
                request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _storageMock.Setup(s => s.SaveAsync(
                It.IsAny<Stream>(), It.IsAny<string>(),
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(savedUri);

        var act = async () => await _handler.Handle(
            ValidCommand(request.Id), CancellationToken.None);

        // Act + Assert — domain throws, file should be cleaned up
        await act.Should().ThrowAsync<InvalidRequestStateException>();

        _storageMock.Verify(s => s.DeleteAsync(
            savedUri, It.IsAny<CancellationToken>()),
            Times.Once);
    }
}