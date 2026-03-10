using ErrandsManagement.Application.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Auth.Commands.LoginUser;

public sealed record LoginUserCommand(
    string Email,
    string Password
) : IRequest<AuthResponseDto>;