using MediatR;

namespace ErrandsManagement.Application.Users.Commands.CreateUser;

public sealed record CreateUserCommand(
    string FullName,
    string Email,
    string Role) : IRequest<Guid>;