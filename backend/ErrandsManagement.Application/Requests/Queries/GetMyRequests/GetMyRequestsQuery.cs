using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetMyRequests;

public sealed record GetMyRequestsQuery(
    Guid RequesterId,
    RequestQueryParameters Parameters)
    : IRequest<PagedResult<RequestListItemDto>>;