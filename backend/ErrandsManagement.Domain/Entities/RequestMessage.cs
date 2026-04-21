using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Entities;

public class RequestMessage : BaseEntity
{
    public Guid RequestId { get; private set; }
    public Guid SenderId { get; private set; }
    public string Content { get; private set; } = string.Empty;
    public Request? Request { get; private set; }
    private RequestMessage() { } // EF Core

    public static RequestMessage Create(Guid requestId, Guid senderId, string content)
    {
        if (string.IsNullOrWhiteSpace(content))
            throw new ArgumentException("Message content cannot be empty.", nameof(content));
        if (content.Length > 2000)
            throw new ArgumentException("Message content cannot exceed 2000 characters.", nameof(content));

        var message = new RequestMessage
        {
            Id = Guid.NewGuid(),
            RequestId = requestId,
            SenderId = senderId,
            Content = content.Trim(),
            CreatedAt = DateTime.UtcNow
        };

        message.RaiseDomainEvent(new RequestMessageCreatedEvent(
            message.Id, message.RequestId, message.SenderId,
            message.Content, message.CreatedAt));

        return message;
    }
}