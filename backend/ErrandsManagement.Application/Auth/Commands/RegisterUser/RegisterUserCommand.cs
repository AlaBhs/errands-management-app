using ErrandsManagement.Application.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Auth.Commands.RegisterUser;

public sealed record RegisterUserCommand(
    string FullName,
    string Email,
    string Password,
    string Role,
    double? Latitude = null,
    double? Longitude = null,
    string? City = null
) : IRequest<AuthResponseDto>;