using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetMyAssignments;

public sealed record GetMyAssignmentsQuery(
    Guid CourierId,
    RequestQueryParameters Parameters)
    : IRequest<PagedResult<RequestListItemDto>>;