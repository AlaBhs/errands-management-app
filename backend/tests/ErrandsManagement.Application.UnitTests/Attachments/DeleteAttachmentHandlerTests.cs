using ErrandsManagement.Application.Attachments.Commands.DeleteAttachment;
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Features.Attachments.Commands.DeleteAttachment;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using FluentAssertions;
using Moq;

namespace ErrandsManagement.Application.UnitTests.Attachments;

public class DeleteAttachmentHandlerTests
{
    private readonly Mock<IRequestRepository> _repoMock = new();
    private readonly Mock<IFileStorageService> _storageMock = new();
    private readonly DeleteAttachmentHandler _handler;

    private static readonly Address DefaultAddress =
        new("Street", "City", "1000", "Tunisia");

    public DeleteAttachmentHandlerTests()
    {
        _handler = new DeleteAttachmentHandler(
            _repoMock.Object,
            _storageMock.Object);
    }

    [Fact]
    public async Task Handle_Should_Remove_Attachment_And_Delete_File()
    {
        var request = new Request(
            "Title", "Description", Guid.NewGuid(),
            DefaultAddress, PriorityLevel.Normal,
            RequestCategory.Other);

        request.AddAttachment("doc.pdf", "application/pdf", "/uploads/doc.pdf");
        var attachmentId = request.Attachments.First().Id;

        _repoMock.Setup(r => r.GetByIdAsync(
                request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        await _handler.Handle(
            new DeleteAttachmentCommand(request.Id, attachmentId),
            CancellationToken.None);

        // DB save happens before file delete
        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()),
            Times.Once);

        _storageMock.Verify(s => s.DeleteAsync(
            "/uploads/doc.pdf", It.IsAny<CancellationToken>()),
            Times.Once);

        request.Attachments.Should().BeEmpty();
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_Request_Not_Found()
    {
        _repoMock.Setup(r => r.GetByIdAsync(
                It.IsAny<Guid>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Request?)null);

        var act = async () => await _handler.Handle(
            new DeleteAttachmentCommand(Guid.NewGuid(), Guid.NewGuid()),
            CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();

        _storageMock.Verify(s => s.DeleteAsync(
            It.IsAny<string>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Throw_NotFoundException_When_Attachment_Not_Found()
    {
        var request = new Request(
            "Title", "Description", Guid.NewGuid(),
            DefaultAddress, PriorityLevel.Normal,
            RequestCategory.Other);

        _repoMock.Setup(r => r.GetByIdAsync(
                request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        var act = async () => await _handler.Handle(
            new DeleteAttachmentCommand(request.Id, Guid.NewGuid()),
            CancellationToken.None);

        await act.Should().ThrowAsync<NotFoundException>();

        _repoMock.Verify(r => r.SaveChangesAsync(
            It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_Should_Save_Before_Deleting_File()
    {
        // Verifies the critical ordering: DB first, file second
        var saveOrder = 0;
        var deleteOrder = 0;
        var callOrder = 0;

        var request = new Request(
            "Title", "Description", Guid.NewGuid(),
            DefaultAddress, PriorityLevel.Normal,
            RequestCategory.Other);

        request.AddAttachment("doc.pdf", "application/pdf", "/uploads/doc.pdf");
        var attachmentId = request.Attachments.First().Id;

        _repoMock.Setup(r => r.GetByIdAsync(
                request.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync(request);

        _repoMock.Setup(r => r.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .Callback(() => saveOrder = ++callOrder)
            .Returns(Task.CompletedTask);

        _storageMock.Setup(s => s.DeleteAsync(
                It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .Callback(() => deleteOrder = ++callOrder)
            .Returns(Task.CompletedTask);

        await _handler.Handle(
            new DeleteAttachmentCommand(request.Id, attachmentId),
            CancellationToken.None);

        saveOrder.Should().BeLessThan(deleteOrder);
    }
}