namespace ErrandsManagement.Application.Requests.DTOs;

public sealed record RequestDetailsDto(
    Guid Id,
    string Title,
    string Description,
    string Status,
    string Priority,
    string Category,
    string? ContactPerson,
    string? ContactPhone,
    DateTime? Deadline,
    decimal? EstimatedCost,
    Guid RequesterId,
    string RequesterName,
    DateTime CreatedAt,
    AddressDto DeliveryAddress,
    AssignmentDto? CurrentAssignment,
    IReadOnlyCollection<AuditLogDto> AuditLogs,
    SurveyDto? Survey);
