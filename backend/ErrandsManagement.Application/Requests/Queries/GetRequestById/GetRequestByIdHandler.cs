using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestById
{
    public sealed class GetRequestByIdHandler : IRequestHandler<GetRequestByIdQuery, RequestDetailsDto?>
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
            var request = await _repository
                .GetByIdAsync(query.Id, cancellationToken);

            if (request is null)
                return null;

            var currentAssignment = request.Assignments
                .OrderByDescending(a => a.AssignedAt)
                .FirstOrDefault(a => !a.IsCompleted);

            return new RequestDetailsDto(
                request.Id,
                request.Title,
                request.Description,
                request.Status.ToString(),
                request.Priority.ToString(),
                request.Deadline,
                request.EstimatedCost,
                request.RequesterId,
                new AddressDto(
                    request.DeliveryAddress.Street,
                    request.DeliveryAddress.City,
                    request.DeliveryAddress.PostalCode,
                    request.DeliveryAddress.Country,
                    request.DeliveryAddress.Note),
                currentAssignment is null
                    ? null
                    : new AssignmentDto(
                        currentAssignment.CourierId,
                        currentAssignment.AssignedAt,
                        currentAssignment.StartedAt,
                        currentAssignment.CompletedAt,
                        currentAssignment.ActualCost,
                        currentAssignment.Note),
                request.AuditLogs
                    .OrderByDescending(a => a.OccurredAt)
                    .Select(a => new AuditLogDto(
                        a.EventType,
                        a.Detail,
                        a.OccurredAt))
                    .ToList(),
                request.Survey is null
                    ? null
                    : new SurveyDto(
                        request.Survey.Rating,
                        request.Survey.Comment)
            );
        }
    }
}
