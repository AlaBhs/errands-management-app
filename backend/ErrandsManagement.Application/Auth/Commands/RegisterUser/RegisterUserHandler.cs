using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Application.Auth.Commands.RegisterUser;

public sealed class RegisterUserHandler : IRequestHandler<RegisterUserCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;

    public RegisterUserHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<AuthResponseDto> Handle(RegisterUserCommand request, CancellationToken ct)
    {
        var existing = await _userRepository.FindByEmailAsync(request.Email, ct);
        if (existing is not null)
            throw new InvalidOperationException("A user with this email already exists.");

        var userId = Guid.NewGuid();
        var newUser = new UserDto(userId, request.Email, request.FullName, [], true);

        await _userRepository.CreateAsync(newUser, request.Password, ct);
        await _userRepository.AssignRoleAsync(userId, request.Role, ct);

        var created = await _userRepository.FindByEmailAsync(request.Email, ct);

        // No tokens — Admin is provisioning an account for someone else
        return new AuthResponseDto(
            AccessToken: string.Empty,
            RefreshToken: string.Empty,
            ExpiresAt: DateTime.UtcNow,
            Email: created!.Email,
            FullName: created.FullName,
            Roles: created.Roles
        );
    }
}