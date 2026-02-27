using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Common.Exceptions;
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
        AddAudit("Created", "Request created.");
    }
    private void AddAudit(string eventType, string detail)
    {
        _auditLogs.Add(new AuditLog(Id, eventType, detail));
    }
    public void Assign(Guid courierId)
    {
        if (Status != RequestStatus.Pending)
            throw new InvalidRequestStateException("Only pending requests can be assigned.");

        var assignment = new Assignment(Id, courierId);
        _assignments.Add(assignment);

        Status = RequestStatus.Assigned;
        MarkAsUpdated();

        AddAudit("Assigned", $"Request assigned to courier {courierId}");
    }
    public void Start()
    {
        if (Status != RequestStatus.Assigned)
            throw new InvalidRequestStateException("Only assigned requests can start.");

        Status = RequestStatus.InProgress;
        MarkAsUpdated();

        AddAudit("Started", "Request marked as in progress.");
    }
    public void Complete(decimal? actualCost = null)
    {
        if (Status != RequestStatus.InProgress)
            throw new InvalidRequestStateException("Only in-progress requests can be completed.");

        Status = RequestStatus.Completed;
        MarkAsUpdated();

        AddAudit("Completed", "Request completed.");
    }
    public void Cancel()
    {
        if (Status == RequestStatus.Completed)
            throw new InvalidRequestStateException("Completed requests cannot be cancelled.");

        Status = RequestStatus.Cancelled;
        MarkAsUpdated();

        AddAudit("Cancelled", "Request cancelled.");
    }
    public void SubmitSurvey(int rating, string? comment)
    {
        if (Status != RequestStatus.Completed)
            throw new SurveyNotAllowedException("Survey can only be submitted after completion.");

        if (Survey != null)
            throw new SurveyNotAllowedException("Survey already submitted.");

        Survey = new Survey(Id, rating, comment);

        AddAudit("SurveySubmitted", "Satisfaction survey submitted.");
    }
}