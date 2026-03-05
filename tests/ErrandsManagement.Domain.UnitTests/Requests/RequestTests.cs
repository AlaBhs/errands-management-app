using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.UnitTests.Builders;
using FluentAssertions;
using Xunit;

namespace ErrandsManagement.Domain.UnitTests.Requests;

public class RequestTests
{
    [Fact]
    public void New_Request_Should_Start_As_Pending()
    {
        var request = new RequestBuilder().Build();

        request.Status.Should().Be(RequestStatus.Pending);
    }

    [Fact]
    public void Assign_Should_Change_Status_To_Assigned()
    {
        var request = new RequestBuilder().Build();

        request.Assign(Guid.NewGuid());

        request.Status.Should().Be(RequestStatus.Assigned);
    }

    [Fact]
    public void Assign_Should_Throw_If_Not_Pending()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());

        Action act = () => request.Assign(Guid.NewGuid());

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Start_Should_Change_Status_To_InProgress()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());

        request.Start();

        request.Status.Should().Be(RequestStatus.InProgress);
    }

    [Fact]
    public void Start_Should_Throw_If_Not_Assigned()
    {
        var request = new RequestBuilder().Build();

        Action act = () => request.Start();

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Complete_Should_Change_Status_To_Completed()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());
        request.Start();

        request.Complete();

        request.Status.Should().Be(RequestStatus.Completed);
    }

    [Fact]
    public void Cannot_Complete_If_Not_InProgress()
    {
        var request = new RequestBuilder().Build();

        Action act = () => request.Complete();

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Cancel_Should_Set_Status_To_Cancelled()
    {
        var request = new RequestBuilder().Build();

        request.Cancel(null);

        request.Status.Should().Be(RequestStatus.Cancelled);
    }

    [Fact]
    public void Cancel_InProgress_Request_Should_Require_Reason()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());
        request.Start();

        Action act = () => request.Cancel(null);

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Cannot_Cancel_Completed_Request()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());
        request.Start();
        request.Complete();

        Action act = () => request.Cancel("reason");

        act.Should().Throw<InvalidRequestStateException>();
    }

    [Fact]
    public void Survey_Should_Be_Allowed_Only_When_Completed()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());
        request.Start();
        request.Complete();

        request.SubmitSurvey(5, "Great");

        request.Survey.Should().NotBeNull();
    }

    [Fact]
    public void Survey_Should_Fail_If_Not_Completed()
    {
        var request = new RequestBuilder().Build();

        Action act = () => request.SubmitSurvey(5, "Test");

        act.Should().Throw<SurveyNotAllowedException>();
    }

    [Fact]
    public void Cannot_Submit_Survey_Twice()
    {
        var request = new RequestBuilder().Build();
        request.Assign(Guid.NewGuid());
        request.Start();
        request.Complete();

        request.SubmitSurvey(5, "Great");

        Action act = () => request.SubmitSurvey(5, "Again");

        act.Should().Throw<SurveyNotAllowedException>();
    }
}