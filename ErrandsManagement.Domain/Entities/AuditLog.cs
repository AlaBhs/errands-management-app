using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid RequestId { get; private set; }

    public string EventType { get; private set; }
    public string Detail { get; private set; }
    public DateTime OccurredAt { get; private set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    private AuditLog() { }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

    public AuditLog(Guid requestId, string eventType, string detail)
    {
        RequestId = requestId;
        EventType = eventType;
        Detail = detail;
        OccurredAt = DateTime.UtcNow;
    }

}