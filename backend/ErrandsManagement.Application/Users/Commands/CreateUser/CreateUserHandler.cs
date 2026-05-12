using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.Commands.SendActivationEmail;
using MediatR;

namespace ErrandsManagement.Application.Users.Commands.CreateUser;

public sealed class CreateUserHandler : IRequestHandler<CreateUserCommand, Guid>
{
    private readonly IUserRepository _users;
    private readonly ISender _mediator;

    public CreateUserHandler(IUserRepository users, ISender mediator)
        => (_users, _mediator) = (users, mediator);

    public async Task<Guid> Handle(CreateUserCommand request, CancellationToken ct)
    {
        var existing = await _users.FindByEmailAsync(request.Email, ct);
        if (existing is not null)
            throw new ConflictException($"Email '{request.Email}' is already registered.");

        var userId = Guid.NewGuid();
        var dto = new UserDto(userId, request.Email, request.FullName, [], true,
                              null, null, null);

        await _users.CreateWithoutPasswordAsync(dto, ct);
        await _users.AssignRoleAsync(userId, request.Role, ct);
        await _mediator.Send(new SendActivationEmailCommand(userId, request.Email), ct);

        return userId;
    }
}