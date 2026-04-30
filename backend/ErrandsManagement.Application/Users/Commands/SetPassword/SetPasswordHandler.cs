using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.SetPassword;

public sealed class SetPasswordHandler : IRequestHandler<SetPasswordCommand>
{
    private readonly IUserRepository _users;

    public SetPasswordHandler(IUserRepository users) => _users = users;

    public async Task Handle(SetPasswordCommand request, CancellationToken ct)
    {
        var user = await _users.FindByEmailAsync(request.Email, ct)
            ?? throw new NotFoundException("User", request.Email);

        // InvalidOperationException thrown here is mapped to 400 by ExceptionHandlingMiddleware
        await _users.SetPasswordAsync(user.Id, request.Token, request.NewPassword, ct);
    }
}