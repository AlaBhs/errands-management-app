using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetAllRequests;

public sealed class GetAllRequestsHandler : IRequestHandler<GetAllRequestsQuery, List<RequestListItemDto>>
{
    private readonly IRequestRepository _requestRepository;

    public GetAllRequestsHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<List<RequestListItemDto>> Handle(
        GetAllRequestsQuery query,
        CancellationToken cancellationToken)
    {
        return await _requestRepository.GetAllAsync(cancellationToken);
    }
}