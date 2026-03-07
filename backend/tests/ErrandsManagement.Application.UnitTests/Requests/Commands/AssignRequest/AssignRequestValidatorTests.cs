using ErrandsManagement.Application.Requests.Commands.AssignRequest;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.AssignRequest;

public class AssignRequestValidatorTests
{
    private readonly AssignRequestValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = new AssignRequestCommand(Guid.NewGuid(), Guid.NewGuid());

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_RequestId_Is_Empty()
    {
        var command = new AssignRequestCommand(Guid.Empty, Guid.NewGuid());

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RequestId");
    }

    [Fact]
    public void Should_Fail_When_CourierId_Is_Empty()
    {
        var command = new AssignRequestCommand(Guid.NewGuid(), Guid.Empty);

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "CourierId");
    }
}