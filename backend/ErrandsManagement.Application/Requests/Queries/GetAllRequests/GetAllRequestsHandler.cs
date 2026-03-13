using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetAllRequests;

public sealed class GetAllRequestsHandler
    : IRequestHandler<GetAllRequestsQuery, PagedResult<RequestListItemDto>>
{
    private readonly IRequestRepository _requestRepository;

    public GetAllRequestsHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<PagedResult<RequestListItemDto>> Handle(
        GetAllRequestsQuery request,
        CancellationToken cancellationToken)
    {
        return await _requestRepository.GetPagedAsync(
            request.Parameters,
            cancellationToken);
    }
}