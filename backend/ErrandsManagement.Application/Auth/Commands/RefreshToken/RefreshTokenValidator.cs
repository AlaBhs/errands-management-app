using FluentValidation;

namespace ErrandsManagement.Application.Auth.Commands.RefreshToken;

public sealed class RefreshTokenValidator : AbstractValidator<RefreshTokenCommand>
{
    public RefreshTokenValidator()
    {
        RuleFor(x => x.Token).NotEmpty();
    }
}