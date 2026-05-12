using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.RequestTemplates.DTOs;
using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Queries.GetMyRequestTemplates;

public sealed record GetMyRequestTemplatesQuery(
    Guid UserId,
    RequestTemplateQueryParameters Parameters)
    : IRequest<PagedResult<RequestTemplateListItemDto>>;