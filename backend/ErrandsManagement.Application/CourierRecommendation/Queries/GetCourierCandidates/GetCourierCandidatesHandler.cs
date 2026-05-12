using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.CourierRecommendation.DTOs;
using ErrandsManagement.Application.CourierRecommendation.Interfaces;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.CourierRecommendation.Queries.GetCourierCandidates;

public sealed class GetCourierCandidatesHandler
    : IRequestHandler<GetCourierCandidatesQuery, List<CourierScoreDto>>
{
    private readonly IRequestRepository _requestRepository;
    private readonly ICourierRecommendationEngine _engine;

    public GetCourierCandidatesHandler(
        IRequestRepository requestRepository,
        ICourierRecommendationEngine engine)
    {
        _requestRepository = requestRepository;
        _engine = engine;
    }

    public async Task<List<CourierScoreDto>> Handle(
        GetCourierCandidatesQuery query,
        CancellationToken cancellationToken)
    {
        var request = await _requestRepository.GetByIdAsync(query.RequestId, cancellationToken);

        if (request is null)
            throw new NotFoundException("Request not found.");

        var recommendationRequest = new RecommendationRequestDto(
            RequestId: request.Id,
            DeliveryLatitude: request.DeliveryAddress.Latitude,
            DeliveryLongitude: request.DeliveryAddress.Longitude,
            Priority: request.Priority);

        var scores = await _engine.RecommendAsync(recommendationRequest, cancellationToken);

        return scores.Select(s => new CourierScoreDto(
            CourierId: s.CourierId,
            FullName: s.FullName,
            Email: s.Email,
            City: s.City,
            ActiveAssignmentsCount: s.ActiveAssignmentsCount,
            AverageRating: s.AverageRating,
            CompletionRate: s.CompletionRate,
            DistanceKm: s.DistanceKm,
            TotalScore: s.TotalScore,
            ScoreBreakdown: new ScoreBreakdownDto(
                s.AvailabilityScore,
                s.ProximityScore,
                s.PerformanceScore)))
        .ToList();
    }
}