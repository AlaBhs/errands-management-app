using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestById
{
    public sealed class GetRequestByIdHandler
    {
        private readonly IRequestRepository _repository;

        public GetRequestByIdHandler(IRequestRepository repository)
        {
            _repository = repository;
        }

        public async Task<RequestDetailsDto?> Handle(
            GetRequestByIdQuery query,
            CancellationToken cancellationToken)
        {
            var request = await _repository.GetByIdAsync(query.Id, cancellationToken);

            if (request is null)
                return null;

            return new RequestDetailsDto(
                request.Id,
                request.Title,
                request.Description,
                request.Status.ToString(),
                request.Priority.ToString(),
                request.Deadline,
                request.EstimatedCost,
                request.RequesterId);
        }
    }
}
