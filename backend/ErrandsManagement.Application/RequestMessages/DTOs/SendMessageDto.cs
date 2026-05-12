namespace ErrandsManagement.Application.RequestMessages.DTOs;

/// <summary>
/// Payload accepted by POST /api/requests/{id}/messages.
/// </summary>
public sealed class SendMessageDto
{
    public string Content { get; init; } = string.Empty;
}
