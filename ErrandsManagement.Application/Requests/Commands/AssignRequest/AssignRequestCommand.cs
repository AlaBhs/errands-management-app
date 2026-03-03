using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.AssignRequest
{
    public sealed record AssignRequestCommand(
        Guid RequestId,
        Guid CourierId
    ) : IRequest;
}
