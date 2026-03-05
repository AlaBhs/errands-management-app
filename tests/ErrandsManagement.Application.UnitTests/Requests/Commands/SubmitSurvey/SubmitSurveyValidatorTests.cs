using ErrandsManagement.Application.Requests.Commands.SubmitSurvey;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.SubmitSurvey;

public class SubmitSurveyValidatorTests
{
    private readonly SubmitSurveyValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Rating_Is_Valid()
    {
        var command = new SubmitSurveyCommand(Guid.NewGuid(), 4, "Good service");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_RequestId_Is_Empty()
    {
        var command = new SubmitSurveyCommand(Guid.Empty, 4, "Test");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RequestId");
    }

    [Fact]
    public void Should_Fail_When_Rating_Is_Out_Of_Range()
    {
        var command = new SubmitSurveyCommand(Guid.NewGuid(), 10, "Bad");

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
    }
}