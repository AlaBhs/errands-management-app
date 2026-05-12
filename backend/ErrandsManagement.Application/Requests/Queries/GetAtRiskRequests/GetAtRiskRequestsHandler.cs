using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetAtRiskRequests;

public sealed class GetAtRiskRequestsHandler
    : IRequestHandler<GetAtRiskRequestsQuery, List<AtRiskRequestDto>>
{
    private readonly IRequestRepository _repository;

    public GetAtRiskRequestsHandler(IRequestRepository repository)
        => _repository = repository;

    public Task<List<AtRiskRequestDto>> Handle(
        GetAtRiskRequestsQuery request,
        CancellationToken cancellationToken)
        => _repository.GetAtRiskRequestsAsync(DateTime.UtcNow, cancellationToken);
}