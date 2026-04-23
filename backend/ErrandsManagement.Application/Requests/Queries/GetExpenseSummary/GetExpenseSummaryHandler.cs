using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetExpenseSummary;

public sealed class GetExpenseSummaryHandler
    : IRequestHandler<GetExpenseSummaryQuery, ExpenseSummaryDto>
{
    private readonly IRequestRepository _requestRepository;

    public GetExpenseSummaryHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<ExpenseSummaryDto> Handle(
        GetExpenseSummaryQuery query,
        CancellationToken cancellationToken)
    {
        return await _requestRepository.GetExpenseSummaryAsync(
            query.RequestId,
            cancellationToken);
    }
}