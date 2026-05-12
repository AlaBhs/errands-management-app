using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Commands.CreateRequestTemplate;

public sealed record CreateRequestTemplateFromRequestCommand(
    Guid RequestId,
    string TemplateName,
    Guid UserId)
    : IRequest<Guid>;