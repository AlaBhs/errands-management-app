using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Domain.Entities;

public sealed class RequestTemplate : BaseEntity
{
#pragma warning disable CS8618
    private RequestTemplate() { } // EF Core
#pragma warning restore CS8618

    public string Name { get; private set; }
    public string Title { get; private set; }
    public string Description { get; private set; }
    public RequestCategory Category { get; private set; }
    public Address Address { get; private set; }
    public decimal? EstimatedCost { get; private set; }
    public Guid CreatedBy { get; private set; }
    public string? ContactPerson { get; private set; }
    public string? ContactPhone { get; private set; }

    public RequestTemplate(
        string name,
        string title,
        string description,
        RequestCategory category,
        Address address,
        decimal? estimatedCost,
        Guid createdBy,
        string? contactPerson = null,
        string? contactPhone = null)
    {
        if (string.IsNullOrWhiteSpace(name))
            throw new ArgumentException("Template name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(title))
            throw new ArgumentException("Title is required.", nameof(title));
        if (string.IsNullOrWhiteSpace(description))
            throw new ArgumentException("Description is required.", nameof(description));

        Name = name.Trim();
        Title = title;
        Description = description;
        Category = category;
        Address = address;
        EstimatedCost = estimatedCost;
        CreatedBy = createdBy;
        ContactPerson = contactPerson;
        ContactPhone = contactPhone;
    }
}