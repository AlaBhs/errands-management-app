using ErrandsManagement.Application.Attachments.DTOs;

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
    string? Comment,
    DateTime? Deadline,
    decimal? EstimatedCost,
    Guid RequesterId,
    string RequesterName,
    DateTime CreatedAt,
    AddressDto DeliveryAddress,
    AssignmentDto? CurrentAssignment,
    IReadOnlyCollection<AuditLogDto> AuditLogs,
    IReadOnlyList<AttachmentDto> Attachments,
    SurveyDto? Survey,
    ExpenseSummaryDto? ExpenseSummary);
