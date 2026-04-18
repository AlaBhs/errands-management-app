using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.CourierRecommendation.DTOs;

public sealed record RecommendationRequestDto(
    Guid RequestId,
    double? DeliveryLatitude,
    double? DeliveryLongitude,
    PriorityLevel Priority);