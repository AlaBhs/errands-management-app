namespace ErrandsManagement.Application.Interfaces;

public interface IEmailService
{
    Task SendActivationEmailAsync(
        string toEmail,
        string activationLink,
        CancellationToken ct = default);

    Task SendPasswordResetEmailAsync(
        string toEmail,
        string resetLink,
        CancellationToken ct = default);
}