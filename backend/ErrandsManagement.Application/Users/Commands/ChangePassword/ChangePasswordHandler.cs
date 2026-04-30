using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.ChangePassword;

public sealed class ChangePasswordHandler : IRequestHandler<ChangePasswordCommand>
{
    private readonly IUserRepository _users;

    public ChangePasswordHandler(IUserRepository users) => _users = users;

    public async Task Handle(ChangePasswordCommand request, CancellationToken ct)
    {
        // Verify user exists before attempting password change
        _ = await _users.GetApplicationUserAsync(request.UserId, ct)
            ?? throw new NotFoundException($"User {request.UserId} not found.");

        // All UserManager logic stays in Infrastructure via IUserRepository
        await _users.ChangePasswordAsync(
            request.UserId,
            request.CurrentPassword,
            request.NewPassword,
            ct);
    }
}