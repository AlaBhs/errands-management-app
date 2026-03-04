using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetAllRequests;


public sealed record GetAllRequestsQuery(
    RequestQueryParameters Parameters)
    : IRequest<PagedResult<RequestListItemDto>>;