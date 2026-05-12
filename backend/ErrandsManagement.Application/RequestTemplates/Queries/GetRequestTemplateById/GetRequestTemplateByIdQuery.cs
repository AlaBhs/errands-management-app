using ErrandsManagement.Application.RequestTemplates.DTOs;
using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Queries.GetRequestTemplateById;

public sealed record GetRequestTemplateByIdQuery(
    Guid TemplateId,
    Guid UserId)
    : IRequest<RequestTemplateDetailsDto>;