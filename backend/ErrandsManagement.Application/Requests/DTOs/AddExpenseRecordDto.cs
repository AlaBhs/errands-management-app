using ErrandsManagement.Domain.Enums;


namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record AddExpenseRecordDto(
    ExpenseCategory Category,
    decimal Amount,
    string? Description);
}
