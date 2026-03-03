using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.CompleteRequest;

public sealed record CompleteRequestCommand(
    Guid RequestId,
    decimal? ActualCost,
    string? Note) : IRequest;
