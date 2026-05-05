using FluentValidation;

namespace ErrandsManagement.Application.Users.Commands.CreateUser;

public sealed class CreateUserValidator : AbstractValidator<CreateUserCommand>
{
    private static readonly string[] AllowedRoles = ["Admin", "Collaborator", "Courier", "Reception"];

    public CreateUserValidator()
    {
        RuleFor(x => x.FullName).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Role)
            .Must(r => AllowedRoles.Contains(r))
            .WithMessage($"Role must be one of: {string.Join(", ", AllowedRoles)}");
    }
}