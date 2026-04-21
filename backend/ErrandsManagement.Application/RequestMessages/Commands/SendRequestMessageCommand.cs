using MediatR;

namespace ErrandsManagement.Application.RequestMessages.Commands;

/// <summary>
/// Sends a message in the discussion thread of a request.
/// Returns the persisted message's Guid.
/// </summary>
public sealed record SendRequestMessageCommand(
    Guid RequestId,
    Guid SenderId,
    string Content) : IRequest<Guid>;
