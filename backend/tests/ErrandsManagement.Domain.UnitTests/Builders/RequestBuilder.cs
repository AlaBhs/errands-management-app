using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.ValueObjects;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.UnitTests.Builders;

public class RequestBuilder
{
    private string _title = "Test Request";
    private string _description = "Test Description";
    private Guid _requesterId = Guid.NewGuid();
    private Address _address = new Address(
        "Main Street",
        "City",
        "1000",
        "Country"
    );
    private PriorityLevel _priority = PriorityLevel.Normal;
    private RequestCategory _category = RequestCategory.Other;
    private string _contactPerson = "Test Contact";
    private string _contactPhone = "+216 55 555 555";
    private string _comment = "Leave at the door";
    private DateTime? _deadline = DateTime.UtcNow.AddDays(1);
    private decimal? _estimatedCost = 10;
    private Guid? _assignedCourierId;
    private bool _started;
    private bool _completed;

    public RequestBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public RequestBuilder WithDescription(string description)
    {
        _description = description;
        return this;
    }

    public RequestBuilder WithPriority(PriorityLevel priority)
    {
        _priority = priority;
        return this;
    }

    public RequestBuilder WithCategory(RequestCategory category)
    {
        _category = category;
        return this;
    }

    public RequestBuilder WithContactPerson(string contactPerson)
    {
        _contactPerson = contactPerson;
        return this;
    }

    public RequestBuilder WithContactPhone(string contactPhone)
    {
        _contactPhone = contactPhone;
        return this;
    }

    public RequestBuilder WithComment(string comment)
    {
        _comment = comment;
        return this;
    }

    public RequestBuilder WithEstimatedCost(decimal? cost)
    {
        _estimatedCost = cost;
        return this;
    }

    public RequestBuilder WithAssignment(Guid courierId)
    {
        _assignedCourierId = courierId;
        return this;
    }

    public RequestBuilder WithStarted()
    {
        _assignedCourierId ??= Guid.NewGuid();
        _started = true;
        return this;
    }

    public RequestBuilder WithCompleted()
    {
        _assignedCourierId ??= Guid.NewGuid();
        _started = true;
        _completed = true;
        return this;
    }

    public Request Build()
    {
        var request = new Request(
            _title,
            _description,
            _requesterId,
            _address,
            _priority,
            _category,
            _contactPerson,
            _contactPhone,
            _comment,
            _deadline,
            _estimatedCost);

        if (_assignedCourierId.HasValue)
        {
            request.Assign(_assignedCourierId.Value);

            if (_started)
                request.Start();

            if (_completed)
                request.Complete(null, null);
        }

        return request;
    }
}