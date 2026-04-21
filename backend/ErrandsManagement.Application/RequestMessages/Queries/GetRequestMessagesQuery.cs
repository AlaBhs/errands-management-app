using ErrandsManagement.Application.RequestMessages.DTOs;
using MediatR;

namespace ErrandsManagement.Application.RequestMessages.Queries;

/// <summary>
/// Returns the full discussion thread of a request,
/// ordered by CreatedAt ascending (chronological).
/// </summary>
public sealed record GetRequestMessagesQuery(
    Guid RequestId,
    Guid RequestingUserId) : IRequest<List<RequestMessageDto>>;
