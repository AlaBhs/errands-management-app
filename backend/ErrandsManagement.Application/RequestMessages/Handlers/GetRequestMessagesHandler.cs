using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.RequestMessages.DTOs;
using ErrandsManagement.Application.RequestMessages.Queries;
using ErrandsManagement.Domain.Enums;
using MediatR;

namespace ErrandsManagement.Application.RequestMessages.Handlers;

/// <summary>
/// Handles <see cref="GetRequestMessagesQuery"/>.
///
/// Enforces the same participant authorization as the send handler,
/// then returns messages in chronological order (CreatedAt ascending).
/// Sender names are resolved in a single batch to avoid N+1 queries.
/// </summary>
public sealed class GetRequestMessagesHandler
    : IRequestHandler<GetRequestMessagesQuery, List<RequestMessageDto>>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IRequestMessageRepository _messageRepository;
    private readonly IUserRepository _userRepository;

    public GetRequestMessagesHandler(
        IRequestRepository requestRepository,
        IRequestMessageRepository messageRepository,
        IUserRepository userRepository)
    {
        _requestRepository = requestRepository;
        _messageRepository = messageRepository;
        _userRepository = userRepository;
    }

    public async Task<List<RequestMessageDto>> Handle(
        GetRequestMessagesQuery query,
        CancellationToken cancellationToken)
    {
        // 1. Verify request exists
        var request = await _requestRepository.GetByIdAsync(
            query.RequestId, cancellationToken)
            ?? throw new NotFoundException($"Request {query.RequestId} not found.");

        // 2. Enforce participant authorization at application layer
        var requestingUser = await _userRepository.FindByIdAsync(
            query.RequestingUserId, cancellationToken)
            ?? throw new NotFoundException($"User {query.RequestingUserId} not found.");

        var userRole = requestingUser.Roles.FirstOrDefault()
            ?? throw new UnauthorizedAccessException("Requesting user has no assigned role.");

        var isParticipant = IsRequestParticipant(request, query.RequestingUserId, userRole);
        if (!isParticipant)
            throw new ForbiddenAccessException(
                "You are not a participant of this request and cannot read its messages.");

        // 3. Load messages (already ordered ascending by repository)
        var messages = await _messageRepository.GetByRequestIdAsync(
            query.RequestId, cancellationToken);

        if (messages.Count == 0)
            return [];

        // 4. Resolve sender display names in batch to avoid N+1
        var senderIds = messages.Select(m => m.SenderId).Distinct().ToList();
        var senderMap = new Dictionary<Guid, (string Name, string Role)>();

        foreach (var senderId in senderIds)
        {
            var user = await _userRepository.FindByIdAsync(senderId, cancellationToken);
            var name = user?.FullName ?? "Unknown";
            var role = user?.Roles.FirstOrDefault() ?? "Unknown";
            senderMap[senderId] = (name, role);
        }

        // 5. Project to DTOs
        return messages
            .Select(m =>
            {
                var (name, role) = senderMap.TryGetValue(m.SenderId, out var info)
                    ? info
                    : ("Unknown", "Unknown");

                return new RequestMessageDto(
                    m.Id,
                    m.RequestId,
                    m.SenderId,
                    name,
                    role,
                    m.Content,
                    m.CreatedAt);
            })
            .ToList();
    }

    private static bool IsRequestParticipant(
        Domain.Entities.Request request,
        Guid userId,
        string role)
    {
        if (string.Equals(role, UserRole.Admin.ToString(), StringComparison.OrdinalIgnoreCase))
            return true;

        if (request.RequesterId == userId)
            return true;

        return request.Assignments.Any(a => a.CourierId == userId && a.IsActive);
    }
}
