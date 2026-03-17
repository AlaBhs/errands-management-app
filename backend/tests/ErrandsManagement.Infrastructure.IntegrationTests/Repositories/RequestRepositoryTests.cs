using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.UnitTests.Builders;
using ErrandsManagement.Domain.ValueObjects;
using ErrandsManagement.Infrastructure.IntegrationTests.Data;
using ErrandsManagement.Infrastructure.Repositories;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Infrastructure.IntegrationTests.Repositories;

public class RequestRepositoryTests
{
    private static Request CreateRequest(string title, DateTime? deadline = null)
    {
        return new Request(
            title,
            "Test description",
            Guid.NewGuid(),
            new Address(
                "Main Street",
                "City",
                "1000",
                "Country"
            ),
            PriorityLevel.Normal,
            RequestCategory.Other,
            "Contact Person", 
            "123456789",
            deadline);
    }

    [Fact]
    public async Task AddAsync_Should_Persist_Request()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var request = new RequestBuilder().Build();

        await repository.AddAsync(request, CancellationToken.None);
        await repository.SaveChangesAsync(CancellationToken.None);

        var saved = await context.Requests.FindAsync(new object?[] { request.Id, CancellationToken.None }, TestContext.Current.CancellationToken);

        saved.Should().NotBeNull();
        saved!.Title.Should().Be(request.Title);
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Request()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var request = new RequestBuilder().Build();

        await context.Requests.AddAsync(request, CancellationToken.None);
        await context.SaveChangesAsync(CancellationToken.None);

        var result = await repository.GetByIdAsync(request.Id, CancellationToken.None);

        result.Should().NotBeNull();
        result!.Id.Should().Be(request.Id);
    }

    [Fact]
    public async Task GetByIdAsync_Should_Return_Null_When_NotFound()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var result = await repository.GetByIdAsync(Guid.NewGuid(), CancellationToken.None);

        result.Should().BeNull();
    }

    [Fact]
    public async Task GetPagedAsync_Should_Return_Correct_Page_Size()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var requests = Enumerable.Range(1, 20)
            .Select(i => CreateRequest($"Request {i}"))
            .ToList();

        context.Requests.AddRange(requests);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10
        };

        var result = await repository.GetPagedAsync(parameters, CancellationToken.None);

        result.Items.Should().HaveCount(10);
    }
    [Fact]
    public async Task GetPagedAsync_Should_Return_Second_Page()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var requests = Enumerable.Range(1, 20)
            .Select(i => CreateRequest($"Request {i}"))
            .ToList();

        context.Requests.AddRange(requests);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var parameters = new RequestQueryParameters
        {
            Page = 2,
            PageSize = 10
        };

        var result = await repository.GetPagedAsync(parameters, CancellationToken.None);

        result.Items.Should().HaveCount(10);
    }
    [Fact]
    public async Task GetPagedAsync_Should_Return_Total_Count()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var requests = Enumerable.Range(1, 15)
            .Select(i => CreateRequest($"Request {i}"))
            .ToList();

        context.Requests.AddRange(requests);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 5
        };

        var result = await repository.GetPagedAsync(parameters, CancellationToken.None);

        result.TotalCount.Should().Be(15);
    }

    [Fact]
    public async Task GetPagedAsync_Should_Sort_By_Deadline()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var r1 = CreateRequest("First", DateTime.UtcNow.AddDays(3));
        var r2 = CreateRequest("Second", DateTime.UtcNow.AddDays(1));
        var r3 = CreateRequest("Third", DateTime.UtcNow.AddDays(2));

        context.Requests.AddRange(r1, r2, r3);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            SortBy = "deadline"
        };

        var result = await repository.GetPagedAsync(parameters, CancellationToken.None);

        result.Items.First().Title.Should().Be("Second");
    }

    [Fact]
    public async Task GetPagedAsync_Should_Filter_By_Search()
    {
        var context = TestDbContextFactory.Create();
        var repository = new RequestRepository(context);

        var r1 = CreateRequest("Buy groceries");
        var r2 = CreateRequest("Pickup package");
        var r3 = CreateRequest("Buy flowers");

        context.Requests.AddRange(r1, r2, r3);
        await context.SaveChangesAsync(TestContext.Current.CancellationToken);

        var parameters = new RequestQueryParameters
        {
            Page = 1,
            PageSize = 10,
            Search = "buy"
        };

        var result = await repository.GetPagedAsync(parameters, CancellationToken.None);

        result.Items.Should().HaveCount(2);
    }
}