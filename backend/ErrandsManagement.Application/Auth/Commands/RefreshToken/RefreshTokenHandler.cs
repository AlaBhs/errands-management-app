using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Application.Auth.Commands.RefreshToken;

public sealed class RefreshTokenHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly JwtSettings _jwtSettings;

    public RefreshTokenHandler(
        IUserRepository userRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var user = await _userRepository.FindByRefreshTokenAsync(request.Token, ct);
        if (user is null)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var isActive = await _userRepository.RefreshTokenIsActiveAsync(request.Token, ct);
        if (!isActive)
            throw new UnauthorizedAccessException("Refresh token has expired or been revoked.");

        // Rotate: revoke consumed token, issue fresh one
        await _userRepository.RevokeRefreshTokenAsync(user.Id, request.Token, ct);

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, user.FullName, user.Roles);
        var refreshToken = _jwtTokenGenerator.GenerateRefreshToken();

        await _userRepository.AddRefreshTokenAsync(
            user.Id, refreshToken, DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDays), ct);

        return new AuthResponseDto(
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(_jwtSettings.ExpiryMinutes),
            user.Email,
            user.FullName,
            user.Roles
        );
    }
}