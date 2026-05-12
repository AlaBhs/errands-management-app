using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Commands.DeleteRequestTemplate;

public sealed record DeleteRequestTemplateCommand(
    Guid TemplateId,
    Guid UserId,
    bool IsAdmin)
    : IRequest;