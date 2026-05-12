

namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record ExpenseRecordDto(
    Guid Id,
    string Category,
    decimal Amount,
    string? Description,
    string CreatedBy,
    DateTime CreatedAt);
}
