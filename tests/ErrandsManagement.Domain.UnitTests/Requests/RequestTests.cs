using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Domain.UnitTests.Requests;

public class RequestTests
{
    private static Request CreateValidRequest()
    {
        return new Request(
            title: "Buy laptop",
            description: "Purchase a new laptop",
            requesterId: Guid.NewGuid(),
            deliveryAddress: new Address("Street", "City", "1000", "TN"),
            priority: PriorityLevel.Normal,
            deadline: DateTime.UtcNow.AddDays(2),
            estimatedCost: 2000);
    }

    [Fact]
    public void New_Request_Should_Start_As_Pending()
    {
        var request = CreateValidRequest();

        request.Status.Should().Be(RequestStatus.Pending);
    }

    [Fact]
    public void Assign_Should_Change_Status_To_Assigned()
    {
        var request = CreateValidRequest();

        request.Assign(Guid.NewGuid());

        request.Status.Should().Be(RequestStatus.Assigned);
    }

    [Fact]
    public void Assign_Should_Throw_If_Not_Pending()
    {
        var request = CreateValidRequest();
        request.Assign(Guid.NewGuid());

        Action act = () => request.Assign(Guid.NewGuid());

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Start_Should_Change_Status_To_InProgress()
    {
        var request = CreateValidRequest();
        request.Assign(Guid.NewGuid());

        request.Start();

        request.Status.Should().Be(RequestStatus.InProgress);
    }

    [Fact]
    public void Complete_Should_Change_Status_To_Completed()
    {
        var request = CreateValidRequest();
        request.Assign(Guid.NewGuid());
        request.Start();

        request.Complete();

        request.Status.Should().Be(RequestStatus.Completed);
    }

    [Fact]
    public void Cannot_Complete_If_Not_InProgress()
    {
        var request = CreateValidRequest();

        Action act = () => request.Complete();

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Cancel_Should_Set_Status_To_Cancelled()
    {
        var request = CreateValidRequest();

        request.Cancel(null);

        request.Status.Should().Be(RequestStatus.Cancelled);
    }

    [Fact]
    public void Cannot_Cancel_Completed_Request()
    {
        var request = CreateValidRequest();
        request.Assign(Guid.NewGuid());
        request.Start();
        request.Complete();

        Action act = () => request.Cancel("reason");

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Survey_Should_Be_Allowed_Only_When_Completed()
    {
        var request = CreateValidRequest();
        request.Assign(Guid.NewGuid());
        request.Start();
        request.Complete();

        request.SubmitSurvey(5, "Great");

        request.Survey.Should().NotBeNull();
    }

    [Fact]
    public void Survey_Should_Fail_If_Not_Completed()
    {
        var request = CreateValidRequest();

        Action act = () => request.SubmitSurvey(5, "Test");

        act.Should().Throw<SurveyNotAllowedException>();
    }
}