
using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.Application.Requests.Commands.AssignRequest
{
    public sealed class AssignRequestHandler
    {
        private readonly IRequestRepository _requestRepository;

        public AssignRequestHandler(IRequestRepository requestRepository)
        {
            _requestRepository = requestRepository;
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
        }
    }
}
