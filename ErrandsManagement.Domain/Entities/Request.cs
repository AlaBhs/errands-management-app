using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.ValueObjects;

namespace ErrandsManagement.Domain.Entities;

public class Request : BaseEntity
{
    private readonly List<Assignment> _assignments = new();
    private readonly List<Attachment> _attachments = new();
    private readonly List<AuditLog> _auditLogs = new();

    public string Title { get; private set; }
    public string Description { get; private set; }
    public DateTime? Deadline { get; private set; }
    public decimal? EstimatedCost { get; private set; }

    public PriorityLevel Priority { get; private set; }
    public RequestStatus Status { get; private set; }

    public Guid RequesterId { get; private set; }

    public Address DeliveryAddress { get; private set; }

    public Survey? Survey { get; private set; }

    public IReadOnlyCollection<Assignment> Assignments => _assignments.AsReadOnly();
    public IReadOnlyCollection<Attachment> Attachments => _attachments.AsReadOnly();
    public IReadOnlyCollection<AuditLog> AuditLogs => _auditLogs.AsReadOnly();

    private Request() { } // For EF

    public Request(
        string title,
        string description,
        Guid requesterId,
        Address deliveryAddress,
        PriorityLevel priority,
        DateTime? deadline = null,
        decimal? estimatedCost = null)
    {
        Title = title;
        Description = description;
        RequesterId = requesterId;
        DeliveryAddress = deliveryAddress;
        Priority = priority;
        Deadline = deadline;
        EstimatedCost = estimatedCost;

        Status = RequestStatus.Pending;
    }
}