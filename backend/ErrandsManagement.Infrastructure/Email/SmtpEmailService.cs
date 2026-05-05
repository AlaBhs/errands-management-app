using ErrandsManagement.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

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
            <p>Welcome to EY Errands!</p>
            <p>Click the link below to set your password and activate your account:</p>
            <p><a href="{activationLink}">Activate my account</a></p>
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
            <p><a href="{resetLink}">Reset my password</a></p>
            <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
            """;
        return SendAsync(toEmail, subject, body, ct);
    }

    private async Task SendAsync(
        string toEmail, string subject, string htmlBody, CancellationToken ct)
    {
        var message = new MimeMessage();
        message.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
        message.To.Add(new MailboxAddress(string.Empty, toEmail));
        message.Subject = subject;
        message.Body = new TextPart("html") { Text = htmlBody };

        using var client = new SmtpClient();

        await client.ConnectAsync(_settings.Host, _settings.Port,
            SecureSocketOptions.StartTls, ct);

        await client.AuthenticateAsync(_settings.Username, _settings.Password, ct);
        await client.SendAsync(message, ct);
        await client.DisconnectAsync(true, ct);
    }
}