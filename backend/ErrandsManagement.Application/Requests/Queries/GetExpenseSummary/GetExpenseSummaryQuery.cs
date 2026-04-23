using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetExpenseSummary
{
    public sealed record GetExpenseSummaryQuery(Guid RequestId)
    : IRequest<ExpenseSummaryDto>;
}
