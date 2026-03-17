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
    private DateTime? _deadline = DateTime.UtcNow.AddDays(1);
    private decimal? _estimatedCost = 10;

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

    public RequestBuilder WithEstimatedCost(decimal? cost)
    {
        _estimatedCost = cost;
        return this;
    }

    public Request Build()
    {
        return new Request(
            _title,
            _description,
            _requesterId,
            _address,
            _priority,
            _category,
            _contactPerson,
            _contactPhone,
            _deadline,
            _estimatedCost
        );
    }
}