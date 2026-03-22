using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.CompleteRequest;

public class CompleteRequestValidatorTests
{
    private readonly CompleteRequestValidator _validator = new();

    private static CompleteRequestCommand ValidCommand(
        decimal? actualCost = 20m,
        string? note = "Delivered") =>
        new(
            RequestId: Guid.NewGuid(),
            ActualCost: actualCost,
            Note: note,
            DischargePhotoFileName: null,
            DischargePhotoContentType: null,
            DischargePhotoSize: 0,
            DischargePhotoStream: null);

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var result = _validator.Validate(ValidCommand());
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_RequestId_Is_Empty()
    {
        var command = ValidCommand() with { RequestId = Guid.Empty };
        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RequestId");
    }

    [Fact]
    public void Should_Fail_When_ActualCost_Is_Negative()
    {
        var result = _validator.Validate(ValidCommand(actualCost: -5m));
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "ActualCost");
    }

    [Fact]
    public void Should_Pass_When_ActualCost_Is_Null()
    {
        var result = _validator.Validate(ValidCommand(actualCost: null));
        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_Photo_ContentType_Is_Invalid()
    {
        var command = new CompleteRequestCommand(
            RequestId: Guid.NewGuid(),
            ActualCost: null,
            Note: null,
            DischargePhotoFileName: "receipt.pdf",
            DischargePhotoContentType: "application/pdf",  // PDF not allowed
            DischargePhotoSize: 1024,
            DischargePhotoStream: Stream.Null);

        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(
            e => e.PropertyName == "DischargePhotoContentType");
    }

    [Fact]
    public void Should_Fail_When_Photo_Exceeds_Size_Limit()
    {
        var command = new CompleteRequestCommand(
            RequestId: Guid.NewGuid(),
            ActualCost: null,
            Note: null,
            DischargePhotoFileName: "photo.jpg",
            DischargePhotoContentType: "image/jpeg",
            DischargePhotoSize: 11 * 1024 * 1024,   // 11 MB — over limit
            DischargePhotoStream: Stream.Null);

        var result = _validator.Validate(command);
        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(
            e => e.PropertyName == "DischargePhotoSize");
    }

    [Fact]
    public void Should_Pass_When_Photo_Is_Valid_Image()
    {
        var command = new CompleteRequestCommand(
            RequestId: Guid.NewGuid(),
            ActualCost: null,
            Note: null,
            DischargePhotoFileName: "photo.jpg",
            DischargePhotoContentType: "image/jpeg",
            DischargePhotoSize: 1024 * 1024,        // 1 MB
            DischargePhotoStream: Stream.Null);

        var result = _validator.Validate(command);
        result.IsValid.Should().BeTrue();
    }
}