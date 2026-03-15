using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.CancelRequest;

public sealed record CancelRequestCommand(
    Guid RequestId,
    string? Reason,
    string CallerRole) : IRequest;