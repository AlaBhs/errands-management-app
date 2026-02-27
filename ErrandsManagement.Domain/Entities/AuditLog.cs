using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Entities;

public class AuditLog : BaseEntity
{
    public Guid RequestId { get; private set; }

    public string EventType { get; private set; }
    public string Detail { get; private set; }
    public DateTime OccurredAt { get; private set; }

    private AuditLog() { }

    public AuditLog(Guid requestId, string eventType, string detail)
    {
        RequestId = requestId;
        EventType = eventType;
        Detail = detail;
        OccurredAt = DateTime.UtcNow;
    }

}