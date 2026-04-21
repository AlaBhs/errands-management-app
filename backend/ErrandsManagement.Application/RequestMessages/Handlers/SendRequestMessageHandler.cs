using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.RequestMessages.Commands;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.RequestMessages.Handlers;

/// <summary>
/// Handles <see cref="SendRequestMessageCommand"/>.
///
/// Responsibilities:
///   1. Load the request and verify it exists.
///   2. Enforce participant authorization (no controller policy needed).
///   3. Create the immutable RequestMessage domain entity (raises domain event internally).
///   4. Persist and dispatch domain events via MediatR.
///
/// </summary>
public sealed class SendRequestMessageHandler : IRequestHandler<SendRequestMessageCommand, Guid>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IRequestMessageRepository _messageRepository;
    private readonly IUserRepository _userRepository;
    private readonly IPublisher _publisher;

    public SendRequestMessageHandler(
        IRequestRepository requestRepository,
        IRequestMessageRepository messageRepository,
        IUserRepository userRepository,
        IPublisher publisher)
    {
        _requestRepository = requestRepository;
        _messageRepository = messageRepository;
        _userRepository = userRepository;
        _publisher = publisher;
    }

    public async Task<Guid> Handle(
        SendRequestMessageCommand command,
        CancellationToken cancellationToken)
    {
        // 1. Load request
        var request = await _requestRepository.GetByIdAsync(
            command.RequestId, cancellationToken)
            ?? throw new NotFoundException($"Request {command.RequestId} not found.");

        // 2. Enforce participant authorization at application layer
        var sender = await _userRepository.FindByIdAsync(command.SenderId, cancellationToken)
            ?? throw new NotFoundException($"User {command.SenderId} not found.");

        var senderRole = sender.Roles.FirstOrDefault()
            ?? throw new UnauthorizedAccessException("Sender has no assigned role.");

        var isParticipant = IsRequestParticipant(request, command.SenderId, senderRole);
        if (!isParticipant)
            throw new UnauthorizedAccessException(
                "You are not a participant of this request and cannot send messages.");

        // 3. Create immutable message entity (raises RequestMessageCreatedEvent internally)
        var message = RequestMessage.Create(
            command.RequestId,
            command.SenderId,
            command.Content);

        // 4. Persist
        await _messageRepository.AddAsync(message, cancellationToken);
        await _messageRepository.SaveChangesAsync(cancellationToken);

        // 5. Dispatch domain events (notification + realtime handled by separate event handlers)
        foreach (var domainEvent in message.DomainEvents)
            await _publisher.Publish(domainEvent, cancellationToken);

        message.ClearDomainEvents();

        return message.Id;
    }

    /// <summary>
    /// Authorization rule: a user can message on a request only if they are:
    ///   - The request owner (Collaborator)
    ///   - The assigned courier (any active assignment)
    ///   - An Admin (full access)
    /// </summary>
    private static bool IsRequestParticipant(
        Domain.Entities.Request request,
        Guid userId,
        string role)
    {
        if (string.Equals(role, UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase))
            return true;

        if (request.RequesterId == userId)
            return true;

        var isAssignedCourier = request.Assignments
            .Any(a => a.CourierId == userId && a.IsActive);

        return isAssignedCourier;
    }
}
