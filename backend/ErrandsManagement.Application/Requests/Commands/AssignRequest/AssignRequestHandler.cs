
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.AssignRequest
{
    public sealed class AssignRequestHandler
    : IRequestHandler<AssignRequestCommand>
    {
        private readonly IRequestRepository _requestRepository;
        private readonly IMediator _mediator;

        public AssignRequestHandler(IRequestRepository requestRepository, IMediator mediator)
        {
            _requestRepository = requestRepository;
            _mediator = mediator;
        }

        public async Task Handle(
            AssignRequestCommand command,
            CancellationToken cancellationToken)
        {
            var request = await _requestRepository
                .GetByIdAsync(command.RequestId, cancellationToken);

            if (request is null)
                throw new NotFoundException("Request to assign not found.");

            request.Assign(command.CourierId);

            await _requestRepository.SaveChangesAsync(cancellationToken);

            foreach (var domainEvent in request.DomainEvents)
                await _mediator.Publish(domainEvent, cancellationToken);

            request.ClearDomainEvents();
        }
    }
}
