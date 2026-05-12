using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Commands.CreateRequest;
using ErrandsManagement.Domain.Enums;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Commands.CreateRequest;

public class CreateRequestValidatorTests
{
    private readonly CreateRequestValidator _validator = new();

    private static CreateRequestCommand CreateValidCommand()
    {
        return new CreateRequestCommand(
            "Buy groceries",
            "Milk, bread and eggs",
            new AddressDto("Street", "City", "12345", "Country"),
            PriorityLevel.Normal,
            RequestCategory.Other,
            "John Doe",
            "555-1234",
            "Please buy fresh products",
            DateTime.UtcNow.AddDays(2),
            50,
            Guid.NewGuid());
    }

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var command = CreateValidCommand();

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_Title_Is_Empty()
    {
        var command = CreateValidCommand() with { Title = "" };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Title");
    }

    [Fact]
    public void Should_Fail_When_Description_Is_Empty()
    {
        var command = CreateValidCommand() with { Description = "" };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Description");
    }

    [Fact]
    public void Should_Fail_When_EstimatedCost_Is_Negative()
    {
        var command = CreateValidCommand() with { EstimatedCost = -5 };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "EstimatedCost");
    }

    [Fact]
    public void Should_Fail_When_RequesterId_Is_Empty()
    {
        var command = CreateValidCommand() with { RequesterId = Guid.Empty };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "RequesterId");
    }

    [Fact]
    public void Should_Fail_When_Deadline_Is_Less_Than_24Hours_From_Now()
    {
        var command = CreateValidCommand() with
        {
            Deadline = DateTime.UtcNow.AddHours(12)
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Deadline");
    }

    [Fact]
    public void Should_Pass_When_Deadline_Is_More_Than_24Hours_From_Now()
    {
        var command = CreateValidCommand() with
        {
            Deadline = DateTime.UtcNow.AddDays(3)
        };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Pass_When_Deadline_Is_Null()
    {
        var command = CreateValidCommand() with { Deadline = null };

        var result = _validator.Validate(command);

        result.IsValid.Should().BeTrue();
    }
}