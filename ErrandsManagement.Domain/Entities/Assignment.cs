using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Entities;

public class Assignment : BaseEntity
{
    public Guid RequestId { get; private set; }
    public Guid CourierId { get; private set; }

    public DateTime AssignedAt { get; private set; }
    public DateTime? StartedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }
    public decimal? ActualCost { get; private set; }
    public string? Note { get; private set; }

    private Assignment() { }

    public Assignment(Guid requestId, Guid courierId)
    {
        RequestId = requestId;
        CourierId = courierId;
        AssignedAt = DateTime.UtcNow;
    }
}