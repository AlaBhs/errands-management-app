using MediatR;

namespace ErrandsManagement.Application.Users.Commands.SetPassword;

public sealed record SetPasswordCommand(
    string Email,
    string Token,
    string NewPassword,
    string ConfirmPassword) : IRequest;