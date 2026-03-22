using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using FluentAssertions;

namespace ErrandsManagement.Domain.UnitTests.Requests;

public class RequestAttachmentTests
{
    private static readonly Address DefaultAddress =
        new("Street", "City", "1000", "Tunisia");

    private static Request MakeRequest() =>
        new("Title", "Description", Guid.NewGuid(),
            DefaultAddress, PriorityLevel.Normal,
            RequestCategory.Other);

    private static Request MakeCompletedRequest()
    {
        var r = MakeRequest();
        var courierId = Guid.NewGuid();
        r.Assign(courierId);
        r.Start();
        r.Complete(null, null);
        return r;
    }

    // ── AddAttachment ─────────────────────────────────────────────────────────

    [Fact]
    public void AddAttachment_Should_Add_Attachment_To_Request()
    {
        var request = MakeRequest();

        request.AddAttachment("doc.pdf", "application/pdf", "/uploads/doc.pdf");

        request.Attachments.Should().HaveCount(1);
        request.Attachments.First().FileName.Should().Be("doc.pdf");
    }

    [Fact]
    public void AddAttachment_Should_Default_Type_To_Document()
    {
        var request = MakeRequest();

        request.AddAttachment("doc.pdf", "application/pdf", "/uploads/doc.pdf");

        request.Attachments.First().Type.Should().Be(AttachmentType.Document);
    }

    [Fact]
    public void AddAttachment_Should_Throw_When_Five_Attachments_Already_Exist()
    {
        var request = MakeRequest();

        for (var i = 0; i < 5; i++)
            request.AddAttachment(
                $"file{i}.pdf", "application/pdf", $"/uploads/file{i}.pdf");

        var act = () => request.AddAttachment(
            "extra.pdf", "application/pdf", "/uploads/extra.pdf");

        act.Should().Throw<InvalidRequestStateException>()
           .WithMessage("*5*");
    }

    [Fact]
    public void AddAttachment_Should_Allow_Exactly_Five_Attachments()
    {
        var request = MakeRequest();

        for (var i = 0; i < 5; i++)
            request.AddAttachment(
                $"file{i}.pdf", "application/pdf", $"/uploads/file{i}.pdf");

        request.Attachments.Should().HaveCount(5);
    }

    // ── RemoveAttachment ──────────────────────────────────────────────────────

    [Fact]
    public void RemoveAttachment_Should_Remove_Attachment_From_Request()
    {
        var request = MakeRequest();
        request.AddAttachment("doc.pdf", "application/pdf", "/uploads/doc.pdf");
        var attachmentId = request.Attachments.First().Id;

        request.RemoveAttachment(attachmentId);

        request.Attachments.Should().BeEmpty();
    }

    [Fact]
    public void RemoveAttachment_Should_Throw_When_Attachment_Not_Found()
    {
        var request = MakeRequest();

        var act = () => request.RemoveAttachment(Guid.NewGuid());

        act.Should().Throw<InvalidRequestStateException>()
           .WithMessage("*not found*");
    }

    // ── AddDischargePhoto ─────────────────────────────────────────────────────

    [Fact]
    public void AddDischargePhoto_Should_Add_Photo_With_DischargePhoto_Type()
    {
        var request = MakeCompletedRequest();

        request.AddDischargePhoto("photo.jpg", "image/jpeg", "/uploads/photo.jpg");

        request.Attachments.Should().HaveCount(1);
        request.Attachments.First().Type.Should().Be(AttachmentType.DischargePhoto);
    }

    [Fact]
    public void AddDischargePhoto_Should_Throw_When_Request_Not_Completed()
    {
        var request = MakeRequest(); // Pending status

        var act = () => request.AddDischargePhoto(
            "photo.jpg", "image/jpeg", "/uploads/photo.jpg");

        act.Should().Throw<InvalidRequestStateException>()
           .WithMessage("*completed*");
    }

    [Fact]
    public void AddDischargePhoto_Should_Throw_When_Photo_Already_Exists()
    {
        var request = MakeCompletedRequest();
        request.AddDischargePhoto("photo.jpg", "image/jpeg", "/uploads/photo.jpg");

        var act = () => request.AddDischargePhoto(
            "photo2.jpg", "image/jpeg", "/uploads/photo2.jpg");

        act.Should().Throw<InvalidRequestStateException>()
           .WithMessage("*already*");
    }

    [Fact]
    public void AddDischargePhoto_Should_Throw_When_Request_Is_Cancelled()
    {
        var request = MakeRequest();
        request.Cancel(null);

        var act = () => request.AddDischargePhoto(
            "photo.jpg", "image/jpeg", "/uploads/photo.jpg");

        act.Should().Throw<InvalidRequestStateException>();
    }
}