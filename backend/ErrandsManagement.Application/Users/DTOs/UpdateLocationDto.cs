namespace ErrandsManagement.Application.Users.DTOs;

public sealed record UpdateLocationDto(
    double? Latitude,
    double? Longitude,
    string? City);