using MediatR;

namespace ErrandsManagement.Application.Users.Commands.ActivateUser;

public sealed record ActivateUserCommand(Guid UserId) : IRequest;