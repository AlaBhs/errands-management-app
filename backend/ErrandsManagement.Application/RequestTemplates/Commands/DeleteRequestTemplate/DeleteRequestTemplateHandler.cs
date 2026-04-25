using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Commands.DeleteRequestTemplate;

public sealed class DeleteRequestTemplateHandler
    : IRequestHandler<DeleteRequestTemplateCommand>
{
    private readonly IRequestTemplateRepository _repository;

    public DeleteRequestTemplateHandler(IRequestTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task Handle(
        DeleteRequestTemplateCommand command,
        CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(command.TemplateId, cancellationToken)
            ?? throw new NotFoundException(nameof(RequestTemplate), command.TemplateId);

        if (!command.IsAdmin && template.CreatedBy != command.UserId)
            throw new ForbiddenAccessException("You can only delete your own templates.");

        await _repository.DeleteAsync(template, cancellationToken);
        await _repository.SaveChangesAsync(cancellationToken);
    }
}