using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.StartRequest;

public sealed record StartRequestCommand(Guid RequestId) : IRequest;