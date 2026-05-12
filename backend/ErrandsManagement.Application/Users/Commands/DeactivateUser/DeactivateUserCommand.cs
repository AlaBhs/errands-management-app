using MediatR;

namespace ErrandsManagement.Application.Users.Commands.DeactivateUser;

public sealed record DeactivateUserCommand(
    Guid UserId,
    Guid RequestingUserId
) : IRequest;