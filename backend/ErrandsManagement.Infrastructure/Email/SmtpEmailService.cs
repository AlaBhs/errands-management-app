using ErrandsManagement.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;

namespace ErrandsManagement.Infrastructure.Email;

public sealed class SmtpEmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private const string EmailTemplate = @"
<!DOCTYPE html>
<html>
<head>
    <meta charset='utf-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{{subject}}</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); }
        .header { background-color: #000000; padding: 24px 20px; text-align: center; }
        .logo { max-width: 160px; height: auto; }
        .content { padding: 32px 24px; }
        .button { display: inline-block; background-color: #FFD700; color: #000000; text-decoration: none; font-weight: bold; padding: 12px 24px; border-radius: 8px; margin: 20px 0; }
        .footer { background-color: #f9f9f9; padding: 20px; font-size: 12px; color: #666666; text-align: center; border-top: 1px solid #eeeeee; }
        .disclaimer { font-size: 11px; color: #999999; margin-top: 12px; }
    </style>
</head>
<body style='margin:0; padding:20px 10px; background-color:#f5f5f5;'>
    <div class='container'>
        <div class='header'>
            <img src='{{logoUrl}}' alt='EY Errands' class='logo' style='max-width:60px; width:100%; height:auto;'>
        </div>
        <div class='content'>
            <h2 style='margin-top:0; color:#000000;'>{{title}}</h2>
            <p style='color:#333333; line-height:1.5;'>Hello,</p>
            <p style='color:#333333; line-height:1.5;'>{{message}}</p>
            <div style='text-align:center;'>
                <a href='{{link}}' class='button' style='background-color:#FFD700; color:#000000; text-decoration:none; font-weight:bold; padding:12px 24px; border-radius:8px; display:inline-block;'>{{buttonText}}</a>
            </div>
            <p style='color:#333333; line-height:1.5; font-size:14px; margin-top:24px;'>{{expiryNote}}</p>
        </div>
        <div class='footer'>
            <p>Errands Management Platform – powered by EY</p>
            <p>© 2026 Ernst & Young. All rights reserved.</p>
            <p class='disclaimer'>This email was sent to {{toEmail}}. If you believe this was sent in error, contact your system administrator.</p>
        </div>
    </div>
</body>
</html>";

    public SmtpEmailService(IOptions<EmailSettings> options)
        => _settings = options.Value;

    public Task SendActivationEmailAsync(
        string toEmail, string activationLink, CancellationToken ct = default)
    {
        var subject = "Activate your account";
        var body = BuildEmailBody(
            title: "Welcome to EY Errands",
            message: "Please activate your account by clicking the button below:",
            buttonText: "Activate my account",
            link: activationLink,
            expiryNote: "This link expires in 24 hours. If you did not request this, please ignore this email.",
            toEmail: toEmail,
            subject: subject);
        return SendAsync(toEmail, subject, body, ct);
    }

    public Task SendPasswordResetEmailAsync(
        string toEmail, string resetLink, CancellationToken ct = default)
    {
        var subject = "Reset your password";
        var body = BuildEmailBody(
            title: "Reset Your Password",
            message: "We received a request to reset your password. Click the button below to set a new password:",
            buttonText: "Reset my password",
            link: resetLink,
            expiryNote: "This link expires in 1 hour. If you did not request this, please ignore this email.",
            toEmail: toEmail,
            subject: subject);
        return SendAsync(toEmail, subject, body, ct);
    }

    private string BuildEmailBody(
        string title,
        string message,
        string buttonText,
        string link,
        string expiryNote,
        string toEmail,
        string subject)
    {
        return EmailTemplate
            .Replace("{{subject}}", subject)
            .Replace("{{logoUrl}}", _settings.LogoUrl)
            .Replace("{{title}}", title)
            .Replace("{{message}}", message)
            .Replace("{{buttonText}}", buttonText)
            .Replace("{{link}}", link)
            .Replace("{{expiryNote}}", expiryNote)
            .Replace("{{toEmail}}", toEmail);
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