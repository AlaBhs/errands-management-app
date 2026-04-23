using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.RemoveExpenseRecord
{
    public sealed record RemoveExpenseRecordCommand(
    Guid RequestId,
    Guid ExpenseRecordId) : IRequest;
}
