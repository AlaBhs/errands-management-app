using MediatR;

namespace ErrandsManagement.Application.Users.Commands.ChangePassword;

public sealed record ChangePasswordCommand(
    Guid UserId,
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword) : IRequest;