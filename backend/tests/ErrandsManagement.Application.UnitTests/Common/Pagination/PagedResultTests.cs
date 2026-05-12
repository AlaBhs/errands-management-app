using ErrandsManagement.Application.Common.Pagination;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Application.UnitTests.Common.Pagination;

public class PagedResultTests
{
    [Fact]
    public void Should_Create_PagedResult_With_Correct_Metadata()
    {
        var items = new List<int> { 1, 2, 3 };

        var result = PagedResult<int>.Create(
            items,
            page: 2,
            pageSize: 10,
            totalCount: 30);

        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(30);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(3);
    }

    [Fact]
    public void Should_Calculate_TotalPages_Correctly()
    {
        var result = PagedResult<int>.Create(
            new List<int>(),
            page: 1,
            pageSize: 10,
            totalCount: 45);

        result.TotalPages.Should().Be(5);
    }

    [Fact]
    public void Should_Have_One_TotalPage_When_TotalCount_Less_Than_PageSize()
    {
        var result = PagedResult<int>.Create(
            new List<int>(),
            page: 1,
            pageSize: 10,
            totalCount: 5);

        result.TotalPages.Should().Be(1);
    }

    [Fact]
    public void Should_Return_Empty_Items_When_No_Data()
    {
        var result = PagedResult<int>.Create(
            new List<int>(),
            page: 1,
            pageSize: 10,
            totalCount: 0);

        result.Items.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.TotalPages.Should().Be(0);
    }
}