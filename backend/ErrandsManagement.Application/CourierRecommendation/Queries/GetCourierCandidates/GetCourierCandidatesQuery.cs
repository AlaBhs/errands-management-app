using ErrandsManagement.Application.CourierRecommendation.DTOs;
using MediatR;

namespace ErrandsManagement.Application.CourierRecommendation.Queries.GetCourierCandidates;

public sealed record GetCourierCandidatesQuery(Guid RequestId)
    : IRequest<List<CourierScoreDto>>;