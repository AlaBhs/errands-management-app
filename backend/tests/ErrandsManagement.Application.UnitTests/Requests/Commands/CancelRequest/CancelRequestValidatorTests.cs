using ErrandsManagement.Application.Requests.Commands.CancelRequest;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.CancelRequest;

public class CancelRequestValidatorTests
{
    private readonly CancelRequestValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Reason_Is_Valid()
    {
        var command = new CancelRequestCommand(Guid.NewGuid(), "Customer cancelled", "Admin");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_RequestId_Is_Empty()
    {
        var command = new CancelRequestCommand(Guid.Empty, "Reason", "Admin");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RequestId");
    }

    [Fact]
    public void Should_Fail_When_Reason_Too_Long()
    {
        var longReason = new string('a', 600);

        var command = new CancelRequestCommand(Guid.NewGuid(), longReason, "Admin");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
    }
}