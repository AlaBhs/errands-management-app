using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetMyAssignments;

public sealed class GetMyAssignmentsHandler
    : IRequestHandler<GetMyAssignmentsQuery, PagedResult<RequestListItemDto>>
{
    private readonly IRequestRepository _requestRepository;

    public GetMyAssignmentsHandler(IRequestRepository requestRepository)
    {
        _requestRepository = requestRepository;
    }

    public async Task<PagedResult<RequestListItemDto>> Handle(
        GetMyAssignmentsQuery request,
        CancellationToken cancellationToken)
    {
        return await _requestRepository.GetMyAssignmentsAsync(
            request.CourierId,
            request.Parameters,
            cancellationToken);
    }
}