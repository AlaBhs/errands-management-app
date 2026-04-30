using FluentValidation;

namespace ErrandsManagement.Application.Users.Commands.ChangePassword;

public sealed class ChangePasswordValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.CurrentPassword).NotEmpty();
        RuleFor(x => x.NewPassword).NotEmpty().MinimumLength(8);
        RuleFor(x => x.ConfirmPassword)
            .Equal(x => x.NewPassword)
            .WithMessage("Passwords do not match.");
    }
}