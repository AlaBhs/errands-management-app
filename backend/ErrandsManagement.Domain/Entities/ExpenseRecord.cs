using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Domain.Entities;

public sealed class ExpenseRecord : BaseEntity
{
    public Guid RequestId { get; private set; }
    public Guid AssignmentId { get; private set; }

    public ExpenseCategory Category { get; private set; }
    public decimal Amount { get; private set; }
    public string? Description { get; private set; }
    public string CreatedBy { get; private set; }

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.
    private ExpenseRecord() { } // EF
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider adding the 'required' modifier or declaring as nullable.

    internal ExpenseRecord(
        Guid requestId,
        Guid assignmentId,
        ExpenseCategory category,
        decimal amount,
        string createdBy,
        string? description = null)
    {
        if (amount < 0)
            throw new BusinessRuleException("Expense amount must be zero or positive.");

        if (string.IsNullOrWhiteSpace(createdBy))
            throw new BusinessRuleException("CreatedBy is required for expense records.");

        RequestId = requestId;
        AssignmentId = assignmentId;
        Category = category;
        Amount = amount;
        CreatedBy = createdBy;
        Description = description;
    }
}