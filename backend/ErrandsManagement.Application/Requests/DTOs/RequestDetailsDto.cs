namespace ErrandsManagement.Application.Requests.DTOs;

public sealed record RequestDetailsDto(
    Guid Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    DateTime? Deadline,
    decimal? EstimatedCost,
    Guid RequesterId,
    string RequesterName,
    AddressDto DeliveryAddress,
    AssignmentDto? CurrentAssignment,
    IReadOnlyCollection<AuditLogDto> AuditLogs,
    SurveyDto? Survey);
