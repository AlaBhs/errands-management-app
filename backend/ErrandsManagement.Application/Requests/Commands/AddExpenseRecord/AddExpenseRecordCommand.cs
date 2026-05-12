using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.AddExpenseRecord
{
    public sealed record AddExpenseRecordCommand(
    Guid RequestId,
    ExpenseCategory Category,
    decimal Amount,
    string CreatedBy,
    string? Description) : IRequest<Guid>;

}
