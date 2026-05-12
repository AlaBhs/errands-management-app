using ErrandsManagement.Application.Attachments.DTOs;
using ErrandsManagement.Application.DTOs;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.Requests.Queries.GetAllRequests;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestById;

public sealed class GetRequestByIdHandler : IRequestHandler<GetRequestByIdQuery, RequestDetailsDto?>
{
    private readonly IRequestRepository _repository;
    private readonly IUserRepository _userRepository;

    public GetRequestByIdHandler(
        IRequestRepository repository,
        IUserRepository userRepository)
    {
        _repository = repository;
        _userRepository = userRepository;
    }

    public async Task<RequestDetailsDto?> Handle(
        GetRequestByIdQuery query,
        CancellationToken cancellationToken)
    {
        var request = await _repository.GetByIdAsync(query.Id, cancellationToken);

        if (request is null)
            return null;

        var requester = await _userRepository.FindByIdAsync(request.RequesterId, cancellationToken);
        var requesterName = requester?.FullName ?? request.RequesterId.ToString();

        var currentAssignment = request.Assignments
            .OrderByDescending(a => a.AssignedAt)
            .FirstOrDefault();

        AssignmentDto? assignmentDto = null;

        if (currentAssignment is not null)
        {
            var courier = await _userRepository.FindByIdAsync(currentAssignment.CourierId, cancellationToken);
            var courierName = courier?.FullName ?? currentAssignment.CourierId.ToString();

            assignmentDto = new AssignmentDto(
                currentAssignment.CourierId,
                courierName,
                currentAssignment.AssignedAt,
                currentAssignment.StartedAt,
                currentAssignment.CompletedAt,
                currentAssignment.ActualCost,
                currentAssignment.Note);
        }

        return new RequestDetailsDto(
            request.Id,
            request.Title,
            request.Description,
            request.Status.ToString(),
            request.Priority.ToString(),
            request.Category.ToString(),
            request.ContactPerson,
            request.ContactPhone,
            request.Comment,
            request.Deadline,
            request.EstimatedCost,
            request.RequesterId,
            requesterName,
            request.CreatedAt,
            new AddressDto(
                request.DeliveryAddress.City,
                request.DeliveryAddress.PostalCode,
                request.DeliveryAddress.Country,
                request.DeliveryAddress.Street,
                request.DeliveryAddress.Note,
                request.DeliveryAddress.Latitude,
                request.DeliveryAddress.Longitude
                ),
            assignmentDto,
            request.AuditLogs
                .OrderByDescending(a => a.OccurredAt)
                .Select(a => new AuditLogDto(a.EventType, a.Detail, a.OccurredAt))
                .ToList(),
            request.Attachments                          
                .OrderBy(a => a.UploadedAt)
                .Select(a => new AttachmentDto(
                    a.Id,
                    a.FileName,
                    a.ContentType,
                    a.Uri,              
                    a.Type,
                    a.UploadedAt))
                .ToList(),
            request.Survey is null
                ? null
                : new SurveyDto(request.Survey.Rating, request.Survey.Comment));
    }
}