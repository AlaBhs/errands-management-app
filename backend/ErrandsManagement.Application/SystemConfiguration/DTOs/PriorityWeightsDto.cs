namespace ErrandsManagement.Application.SystemConfiguration.DTOs;


public sealed record PriorityWeightsDto(
    double AvailabilityWeight,
    double ProximityWeight,
    double PerformanceWeight);
