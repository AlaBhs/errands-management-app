using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetMyRequests;

public sealed class GetMyRequestsHandler
    : IRequestHandler<GetMyRequestsQuery, PagedResult<RequestListItemDto>>
{
    private readonly IRequestRepository _requestRepository;

    public GetMyRequestsHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<PagedResult<RequestListItemDto>> Handle(
        GetMyRequestsQuery request,
        CancellationToken cancellationToken)
    {
        return await _requestRepository.GetMyRequestsAsync(
            request.RequesterId,
            request.Parameters,
            cancellationToken);
    }
}