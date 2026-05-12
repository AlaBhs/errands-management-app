using MediatR;

namespace ErrandsManagement.Application.Users.Commands.SendActivationEmail;

public sealed record SendActivationEmailCommand(Guid UserId, string Email) : IRequest;