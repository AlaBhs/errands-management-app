using MediatR;

namespace ErrandsManagement.Application.Auth.Commands.Logout;

public sealed record LogoutCommand(string RefreshToken) : IRequest;