using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;
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
    public RequestCategory Category { get; private set; }
    public RequestStatus Status { get; private set; }

    public Guid RequesterId { get; private set; }

    public string? ContactPerson { get; private set; }
    public string? ContactPhone { get; private set; }

    public string? Comment { get; private set; }

    public Address DeliveryAddress { get; private set; }

    public Survey? Survey { get; private set; }

    public DateTime? LastRiskAlertAt { get; private set; }

    public IReadOnlyCollection<Assignment> Assignments => _assignments.AsReadOnly();
    public IReadOnlyCollection<Attachment> Attachments => _attachments.AsReadOnly();
    public IReadOnlyCollection<AuditLog> AuditLogs => _auditLogs.AsReadOnly();

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    private Request() { } // For EF
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

    public Request(
        string title,
        string description,
        Guid requesterId,
        Address deliveryAddress,
        PriorityLevel priority,
        RequestCategory category,
        string? contactPerson = null,
        string? contactPhone = null,
        string? comment = null,
        DateTime? deadline = null,
        decimal? estimatedCost = null)
    {
        Title = title;
        Description = description;
        RequesterId = requesterId;
        DeliveryAddress = deliveryAddress;
        Priority = priority;
        Category = category;
        ContactPerson = contactPerson;
        ContactPhone = contactPhone;
        Comment = comment;
        Deadline = deadline;
        EstimatedCost = estimatedCost;

        Status = RequestStatus.Pending;
        AddAudit("Created", "Request created.");
        RaiseDomainEvent(new RequestCreatedEvent(Id, Title));
    }
    private void AddAudit(string eventType, string detail)
    {
        _auditLogs.Add(new AuditLog(Id, eventType, detail));
    }
    public void Assign(Guid courierId)
    {
        if (Status != RequestStatus.Pending)
            throw new InvalidRequestStateException("Only pending requests can be assigned.");

        if (_assignments.Any(a => a.IsActive))
            throw new InvalidRequestStateException("Request already has an active assignment.");

        var assignment = new Assignment(Id, courierId);
        _assignments.Add(assignment);

        Status = RequestStatus.Assigned;
        RaiseDomainEvent(new RequestAssignedEvent(Id, courierId, Title));
        MarkAsUpdated();

        AddAudit("Assigned", $"Request assigned to courier {courierId}");
    }
    public void Start()
    {
        if (Status != RequestStatus.Assigned)
            throw new InvalidRequestStateException("Only assigned requests can start.");

        var assignment = GetActiveAssignment();
        assignment.Start();

        Status = RequestStatus.InProgress;
        RaiseDomainEvent(new RequestStartedEvent(Id, RequesterId, Title));
        MarkAsUpdated();

        AddAudit("Started", "Request marked as in progress.");
    }
    public void Complete(decimal? actualCost = null, string? note = null)
    {
        if (Status != RequestStatus.InProgress)
            throw new InvalidRequestStateException("Only in-progress requests can be completed.");

        var assignment = GetActiveAssignment();
        assignment.Complete(actualCost, note);

        Status = RequestStatus.Completed;
        RaiseDomainEvent(new RequestCompletedEvent(Id, RequesterId, Title));
        MarkAsUpdated();

        AddAudit("Completed", "Request completed.");
    }
    public void Cancel(string? reason)
    {
        if (Status == RequestStatus.Completed)
            throw new InvalidRequestStateException("Completed requests cannot be cancelled.");

        if (Status == RequestStatus.Cancelled)
            throw new InvalidRequestStateException("Request is already cancelled.");

        if (Status == RequestStatus.InProgress && string.IsNullOrWhiteSpace(reason))
            throw new InvalidRequestStateException("Cancellation reason is required when request is in progress.");

        Status = RequestStatus.Cancelled;
        RaiseDomainEvent(new RequestCancelledEvent(Id, RequesterId, Title));
        MarkAsUpdated();

        AddAudit("Cancelled",
            string.IsNullOrWhiteSpace(reason)
                ? "Request cancelled."
                : $"Request cancelled. Reason: {reason}");
    }
    public void SubmitSurvey(int rating, string? comment)
    {
        if (Status != RequestStatus.Completed)
            throw new SurveyNotAllowedException(
                "Survey can only be submitted for completed requests.");

        if (Survey is not null)
            throw new SurveyNotAllowedException(
                "Survey has already been submitted for this request.");

        Survey = new Survey(rating, comment);

        AddAudit("SurveySubmitted", "Survey submitted by requester.");
    }
    private Assignment GetActiveAssignment()
    {
        var assignment = _assignments.LastOrDefault(a => a.IsActive);

        if (assignment == null)
            throw new InvalidRequestStateException("No active assignment found.");

        return assignment;
    }

    public void AddAttachment(
        string fileName,
        string contentType,
        string uri,
        AttachmentType type = AttachmentType.Document)
    {

        if (Status == RequestStatus.Completed || Status == RequestStatus.Cancelled)
            throw new InvalidRequestStateException(
                "Attachments cannot be added to completed or cancelled requests.");

        if (_attachments.Count >= 5)
            throw new InvalidRequestStateException(
                "A request cannot have more than 5 attachments.");

        _attachments.Add(new Attachment(Id, fileName, contentType, uri, type));
    }

    public void AddDischargePhoto(string fileName, string contentType, string uri)
    {
        if (Status != RequestStatus.Completed)
            throw new InvalidRequestStateException(
                "Discharge photo can only be added to completed requests.");

        var existing = _attachments
            .Any(a => a.Type == AttachmentType.DischargePhoto);

        if (existing)
            throw new InvalidRequestStateException(
                "A discharge photo has already been submitted for this request.");

        _attachments.Add(new Attachment(
            Id, fileName, contentType, uri,
            AttachmentType.DischargePhoto));
    }

    public void RemoveAttachment(Guid attachmentId)
    {
        var attachment = _attachments.FirstOrDefault(a => a.Id == attachmentId)
            ?? throw new InvalidRequestStateException(
                "Attachment not found on this request.");

        _attachments.Remove(attachment);
    }

    public void MarkRiskAlertSent()
    {
        LastRiskAlertAt = DateTime.UtcNow;
        MarkAsUpdated();
    }
}