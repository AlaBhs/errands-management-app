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
    public decimal? AdvancedAmount { get; private set; }
    public DateTime? ReconciledAt { get; private set; }
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

    public void Complete(string? note = null)
    {
        if (!IsStarted)
            throw new InvalidRequestStateException("Assignment must be started before completion.");

        if (IsCompleted)
            throw new InvalidRequestStateException("Assignment already completed.");

        CompletedAt = DateTime.UtcNow;
        Note = note;
    }

    internal void SetAdvancedAmount(decimal amount)
    {
        if (AdvancedAmount.HasValue)
            throw new BusinessRuleException("AdvancedAmount has already been set.");

        if (amount < 0)
            throw new BusinessRuleException("AdvancedAmount must be zero or positive.");

        AdvancedAmount = amount;
        MarkAsUpdated();
    }

    internal void MarkReconciled()
    {
        if (!AdvancedAmount.HasValue)
            throw new BusinessRuleException(
                "Cannot reconcile without a set AdvancedAmount.");

        if (ReconciledAt.HasValue)
            throw new BusinessRuleException("Assignment has already been reconciled.");

        ReconciledAt = DateTime.UtcNow;
        MarkAsUpdated();
    }

    internal void LockActualCost(decimal totalExpenses)
    {
        if (ActualCost.HasValue)
            throw new InvalidRequestStateException(
                "ActualCost has already been locked.");

        ActualCost = totalExpenses;
        MarkAsUpdated();
    }
}