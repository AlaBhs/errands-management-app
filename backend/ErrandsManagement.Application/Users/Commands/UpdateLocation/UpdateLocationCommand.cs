using MediatR;

namespace ErrandsManagement.Application.Users.Commands.UpdateLocation;

public sealed record UpdateLocationCommand(
    Guid UserId,
    double? Latitude,
    double? Longitude,
    string? City) : IRequest;