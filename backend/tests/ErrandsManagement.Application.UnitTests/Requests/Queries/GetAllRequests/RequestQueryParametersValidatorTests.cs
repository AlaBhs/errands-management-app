using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Requests.Queries.GetAllRequests;

public class RequestQueryParametersValidatorTests
{
    private readonly RequestQueryParametersValidator _validator = new();

    [Fact]
    public void Should_Pass_When_Parameters_Are_Valid()
    {
        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            Search = "document",
            SortBy = "deadline"
        };

        var result = _validator.Validate(parameters);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Fail_When_Page_Is_Less_Than_1()
    {
        var parameters = new RequestQueryParameters
        {
            Page = 0,
            PageSize = 10
        };

        var result = _validator.Validate(parameters);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Page");
    }

    [Fact]
    public void Should_Fail_When_Search_Is_Too_Long()
    {
        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            Search = new string('a', 250)
        };

        var result = _validator.Validate(parameters);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "Search");
    }

    [Fact]
    public void Should_Fail_When_SortBy_Is_Invalid()
    {
        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            SortBy = "randomfield"
        };

        var result = _validator.Validate(parameters);

        result.IsValid.Should().BeFalse();
        result.Errors.Should().Contain(e => e.PropertyName == "SortBy");
    }

    [Fact]
    public void Should_Pass_When_SortBy_Is_Allowed()
    {
        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            SortBy = "createdat"
        };

        var result = _validator.Validate(parameters);

        result.IsValid.Should().BeTrue();
    }

    [Fact]
    public void Should_Pass_When_Search_Is_Null()
    {
        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            Search = null
        };

        var result = _validator.Validate(parameters);

        result.IsValid.Should().BeTrue();
    }
}