using System.Net;
using System.Net.Mail;
using ErrandsManagement.Application.Interfaces;
using Microsoft.Extensions.Options;

namespace ErrandsManagement.Infrastructure.Email;

public sealed class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _settings;

    public SmtpEmailService(IOptions<EmailSettings> options)
        => _settings = options.Value;

    public Task SendActivationEmailAsync(
        string toEmail, string activationLink, CancellationToken ct = default)
    {
        var subject = "Activate your account";
        var body = $"""
            <p>Welcome! Click the link below to set your password and activate your account:</p>
            <p><a href="{activationLink}">Activate account</a></p>
            <p>This link expires in 24 hours.</p>
            """;
        return SendAsync(toEmail, subject, body, ct);
    }

    public Task SendPasswordResetEmailAsync(
        string toEmail, string resetLink, CancellationToken ct = default)
    {
        var subject = "Reset your password";
        var body = $"""
            <p>Click the link below to reset your password:</p>
            <p><a href="{resetLink}">Reset password</a></p>
            <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
            """;
        return SendAsync(toEmail, subject, body, ct);
    }

    private async Task SendAsync(
        string toEmail, string subject, string htmlBody, CancellationToken ct)
    {
        using var client = new SmtpClient(_settings.Host, _settings.Port)
        {
            EnableSsl = _settings.UseSsl,
            Credentials = new NetworkCredential(_settings.Username, _settings.Password)
        };
        var msg = new MailMessage(
            from: new MailAddress(_settings.FromAddress, _settings.FromName),
            to: new MailAddress(toEmail))
        {
            Subject = subject,
            Body = htmlBody,
            IsBodyHtml = true
        };
        await client.SendMailAsync(msg, ct);
    }
}