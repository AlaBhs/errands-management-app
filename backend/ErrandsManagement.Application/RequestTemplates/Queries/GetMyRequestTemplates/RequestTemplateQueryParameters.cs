using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Domain.Enums;

namespace ErrandsManagement.Application.RequestTemplates.Queries.GetMyRequestTemplates;

public sealed class RequestTemplateQueryParameters : PaginationParameters
{
    public string? Search { get; init; }
    public RequestCategory? Category { get; init; }
}