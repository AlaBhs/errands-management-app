using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.MarkRequestRiskAlertSent;

/// <summary>
/// Stamps LastRiskAlertAt on a request after an alert has been sent.
/// This is a separate command so the handler does not conflate detection
/// with mutation — respecting CQRS write/read separation.
/// </summary>
public sealed record MarkRequestRiskAlertSentCommand(Guid RequestId) : IRequest;