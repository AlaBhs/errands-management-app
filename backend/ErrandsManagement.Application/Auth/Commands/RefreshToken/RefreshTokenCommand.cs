using ErrandsManagement.Application.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Auth.Commands.RefreshToken;

public sealed record RefreshTokenCommand(string Token) : IRequest<AuthResponseDto>;