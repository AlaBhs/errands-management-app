using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Auth.Commands.Logout;

public sealed class LogoutHandler : IRequestHandler<LogoutCommand>
{
    private readonly IUserRepository _userRepository;

    public LogoutHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task Handle(LogoutCommand request, CancellationToken ct)
    {
        var user = await _userRepository.FindByRefreshTokenAsync(request.RefreshToken, ct);

        // Idempotent — if token is already gone, silently succeed
        if (user is null) return;

        await _userRepository.RevokeRefreshTokenAsync(user.Id, request.RefreshToken, ct);
    }
}