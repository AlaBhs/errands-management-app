using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Application.Auth.Commands.LoginUser;

public sealed class LoginUserHandler : IRequestHandler<LoginUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly JwtSettings _jwtSettings;

    public LoginUserHandler(
        IUserRepository userRepository,
        IJwtTokenGenerator jwtTokenGenerator,
        IOptions<JwtSettings> jwtSettings)
    {
        _userRepository = userRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
        _jwtSettings = jwtSettings.Value;
    }

    public async Task<AuthResponseDto> Handle(LoginUserCommand request, CancellationToken ct)
    {
        var user = await _userRepository.FindByEmailAsync(request.Email, ct);

        // Generic message — never reveal whether the email exists
        if (user is null || !await _userRepository.CheckPasswordAsync(user.Id, request.Password, ct))
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("This account has been deactivated.");

        await _userRepository.RevokeAllActiveRefreshTokensAsync(user.Id, ct);

        var accessToken = _jwtTokenGenerator.GenerateAccessToken(user.Id, user.Email, user.Roles);
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