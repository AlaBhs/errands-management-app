using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.UpdateProfile;

public sealed class UpdateProfileHandler : IRequestHandler<UpdateProfileCommand>
{
    private readonly IUserRepository _users;

    public UpdateProfileHandler(IUserRepository users) => _users = users;

    public async Task Handle(UpdateProfileCommand request, CancellationToken ct)
    {
        _ = await _users.FindByIdAsync(request.UserId, ct)
            ?? throw new NotFoundException($"User {request.UserId} not found.");

        await _users.UpdateProfileAsync(request.UserId, request.FullName, null, ct);
    }
}