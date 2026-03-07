using ErrandsManagement.Application.Requests.Commands.CompleteRequest;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.CompleteRequest;

public class CompleteRequestValidatorTests
{
    private readonly CompleteRequestValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new CompleteRequestCommand(Guid.NewGuid(), 20, "Delivered");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_RequestId_Is_Empty()
    {
        var command = new CompleteRequestCommand(Guid.Empty, 20, "Delivered");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RequestId");
    }

    [Fact]
    public void Should_Fail_When_ActualCost_Is_Negative()
    {
        var command = new CompleteRequestCommand(Guid.NewGuid(), -5, null);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
    }
}