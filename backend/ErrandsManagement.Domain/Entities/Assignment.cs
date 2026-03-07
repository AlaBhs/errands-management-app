using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Common.Exceptions;

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
        if (courierId == Guid.Empty)
            throw new InvalidRequestStateException("CourierId cannot be empty.");

        RequestId = requestId;
        CourierId = courierId;
        AssignedAt = DateTime.UtcNow;
    }

    public bool IsStarted => StartedAt.HasValue;
    public bool IsCompleted => CompletedAt.HasValue;
    public bool IsActive => !IsCompleted;

    public void Start()
    {
        if (IsStarted)
            throw new InvalidRequestStateException("Assignment already started.");

        if (IsCompleted)
            throw new InvalidRequestStateException("Completed assignment cannot be started.");

        StartedAt = DateTime.UtcNow;
    }

    public void Complete(decimal? actualCost, string? note = null)
    {
        if (!IsStarted)
            throw new InvalidRequestStateException("Assignment must be started before completion.");

        if (IsCompleted)
            throw new InvalidRequestStateException("Assignment already completed.");

        CompletedAt = DateTime.UtcNow;
        ActualCost = actualCost;
        Note = note;
    }
}