using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestExpenses;

public sealed class GetRequestExpensesHandler
    : IRequestHandler<GetRequestExpensesQuery, IReadOnlyList<ExpenseRecordDto>>
{
    private readonly IRequestRepository _requestRepository;

    public GetRequestExpensesHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<IReadOnlyList<ExpenseRecordDto>> Handle(
        GetRequestExpensesQuery query,
        CancellationToken cancellationToken)
    {
        return await _requestRepository.GetExpenseRecordsAsync(
            query.RequestId,
            cancellationToken);
    }
}