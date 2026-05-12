using ErrandsManagement.Application.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Auth.Commands.RegisterUser;

public sealed record RegisterUserCommand(
    string FullName,
    string Email,
    string Password,
    string Role
) : IRequest<AuthResponseDto>;