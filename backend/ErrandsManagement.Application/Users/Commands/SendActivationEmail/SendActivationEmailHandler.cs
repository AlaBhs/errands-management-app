using ErrandsManagement.Application.Common.Settings;
using ErrandsManagement.Application.Interfaces;
using MediatR;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Application.Users.Commands.SendActivationEmail;

public sealed class SendActivationEmailHandler : IRequestHandler<SendActivationEmailCommand>
{
    private readonly IUserRepository _users;
    private readonly IEmailService _email;
    private readonly string _frontendBaseUrl;

    public SendActivationEmailHandler(
        IUserRepository users,
        IEmailService email,
        IOptions<AppSettings> appSettings)
    {
        _users = users;
        _email = email;
        _frontendBaseUrl = appSettings.Value.FrontendBaseUrl;
    }

    public async Task Handle(SendActivationEmailCommand request, CancellationToken ct)
    {
        var token = await _users.GenerateEmailConfirmationTokenAsync(request.UserId, ct);
        var encodedToken = Uri.EscapeDataString(token);
        var link = $"{_frontendBaseUrl}/set-password"
                         + $"?token={encodedToken}&email={Uri.EscapeDataString(request.Email)}";

        await _email.SendActivationEmailAsync(request.Email, link, ct);
    }
}