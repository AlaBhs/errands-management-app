using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetAtRiskRequests;

/// <summary>
/// Returns all active requests that are at risk of missing their deadline.
/// Risk is determined at the DB level — no in-memory filtering.
/// </summary>
public sealed record GetAtRiskRequestsQuery : IRequest<List<AtRiskRequestDto>>;