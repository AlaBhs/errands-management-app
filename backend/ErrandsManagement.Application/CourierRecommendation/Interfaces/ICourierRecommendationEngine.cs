using ErrandsManagement.Application.CourierRecommendation.DTOs;
using ErrandsManagement.Application.CourierRecommendation.Models;

namespace ErrandsManagement.Application.CourierRecommendation.Interfaces;

public interface ICourierRecommendationEngine
{
    Task<List<CourierScore>> RecommendAsync(
        RecommendationRequestDto request,
        CancellationToken ct);
}