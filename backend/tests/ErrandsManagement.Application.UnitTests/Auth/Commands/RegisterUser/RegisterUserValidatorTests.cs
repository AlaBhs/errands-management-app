using ErrandsManagement.Application.Auth.Commands.RegisterUser;
using FluentAssertions;

namespace ErrandsManagement.Application.UnitTests.Auth.Commands.RegisterUser;

public class RegisterUserValidatorTests
{
    private readonly RegisterUserValidator _validator = new();

    private static RegisterUserCommand ValidCommand() =>
        new("John Doe", "john@test.local", "Test1234!", "Collaborator");

    [Fact]
    public void Should_Pass_When_Command_Is_Valid()
    {
        var result = _validator.Validate(ValidCommand());

        result.IsValid.Should().BeTrue();
    }

    // ── FullName ──────────────────────────────────────────────────────────────

    [Fact]
    public void Should_Fail_When_FullName_Is_Empty()
    {
        var result = _validator.Validate(ValidCommand() with { FullName = "" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FullName");
    }

    [Fact]
    public void Should_Fail_When_FullName_Exceeds_MaxLength()
    {
        var result = _validator.Validate(
            ValidCommand() with { FullName = new string('a', 201) });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "FullName");
    }

    // ── Email ─────────────────────────────────────────────────────────────────

    [Fact]
    public void Should_Fail_When_Email_Is_Empty()
    {
        var result = _validator.Validate(ValidCommand() with { Email = "" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    [Fact]
    public void Should_Fail_When_Email_Is_Invalid_Format()
    {
        var result = _validator.Validate(ValidCommand() with { Email = "not-an-email" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Email");
    }

    // ── Password ──────────────────────────────────────────────────────────────

    [Fact]
    public void Should_Fail_When_Password_Is_Too_Short()
    {
        var result = _validator.Validate(ValidCommand() with { Password = "Ab1!" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Password");
    }

    [Fact]
    public void Should_Fail_When_Password_Has_No_Uppercase()
    {
        var result = _validator.Validate(ValidCommand() with { Password = "test1234!" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.PropertyName == "Password" &&
            e.ErrorMessage.Contains("uppercase"));
    }

    [Fact]
    public void Should_Fail_When_Password_Has_No_Digit()
    {
        var result = _validator.Validate(ValidCommand() with { Password = "TestPass!" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.PropertyName == "Password" &&
            e.ErrorMessage.Contains("digit"));
    }

    [Fact]
    public void Should_Fail_When_Password_Has_No_Special_Character()
    {
        var result = _validator.Validate(ValidCommand() with { Password = "TestPass1" });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e =>
            e.PropertyName == "Password" &&
            e.ErrorMessage.Contains("special character"));
    }

    // ── Role ──────────────────────────────────────────────────────────────────

    [Theory]
    [InlineData("Admin")]
    [InlineData("Collaborator")]
    [InlineData("Courier")]
    public void Should_Pass_For_All_Allowed_Roles(string role)
    {
        var result = _validator.Validate(ValidCommand() with { Role = role });

        result.IsValid.Should().BeTrue();
    }

    [Theory]
    [InlineData("SuperAdmin")]
    [InlineData("user")]
    [InlineData("")]
    [InlineData("collaborator")] // case-sensitive
    public void Should_Fail_When_Role_Is_Not_Allowed(string role)
    {
        var result = _validator.Validate(ValidCommand() with { Role = role });

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Role");
    }
}