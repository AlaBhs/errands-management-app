using MediatR;
using ErrandsManagement.Application.DTOs;

namespace ErrandsManagement.Application.Requests.Queries.GetAllRequests;

public sealed record GetAllRequestsQuery : IRequest<List<RequestListItemDto>>;