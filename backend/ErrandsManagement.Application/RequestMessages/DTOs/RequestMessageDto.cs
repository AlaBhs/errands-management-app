namespace ErrandsManagement.Application.RequestMessages.DTOs;

/// <summary>
/// Read model returned to clients for a single message.
/// </summary>
public sealed record RequestMessageDto(
    Guid Id,
    Guid RequestId,
    Guid SenderId,
    string SenderName,
    string SenderRole,
    string Content,
    DateTime CreatedAt);
