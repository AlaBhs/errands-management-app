

namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record ExpenseSummaryDto(
    decimal? AdvancedAmount,
    decimal TotalExpenses,
    decimal? Difference,      // null when AdvancedAmount is not set
    bool IsReconciled,
    DateTime? ReconciledAt);
}
