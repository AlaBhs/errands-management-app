using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestExpenses
{
    public sealed record GetRequestExpensesQuery(Guid RequestId)
    : IRequest<IReadOnlyList<ExpenseRecordDto>>;
}
