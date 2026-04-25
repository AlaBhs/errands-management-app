using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Commands.CreateRequestTemplate;

public sealed class CreateRequestTemplateFromRequestHandler
    : IRequestHandler<CreateRequestTemplateFromRequestCommand, Guid>
{
    private readonly IRequestRepository _requestRepository;
    private readonly IRequestTemplateRepository _templateRepository;

    public CreateRequestTemplateFromRequestHandler(
        IRequestRepository requestRepository,
        IRequestTemplateRepository templateRepository)
    {
        _requestRepository = requestRepository;
        _templateRepository = templateRepository;
    }

    public async Task<Guid> Handle(
        CreateRequestTemplateFromRequestCommand command,
        CancellationToken cancellationToken)
    {
        // 1. Load source request
        var request = await _requestRepository.GetByIdAsync(command.RequestId, cancellationToken)
            ?? throw new NotFoundException(nameof(Request), command.RequestId);

        // 2. Ownership guard
        if (request.RequesterId != command.UserId)
            throw new ForbiddenAccessException(
                "You can only create templates from your own requests.");

        // 3. Name uniqueness per user (DB-level check)
        var nameExists = await _templateRepository.ExistsByNameAndUserAsync(
            command.TemplateName, command.UserId, cancellationToken);

        if (nameExists)
            throw new ConflictException(
                $"A template named '{command.TemplateName}' already exists.");

        // 4. Extract only the reusable (static) fields
        var template = new RequestTemplate(
            command.TemplateName,
            request.Title,
            request.Description,
            request.Category,
            request.DeliveryAddress,
            request.EstimatedCost,
            command.UserId,
            request.ContactPerson,
            request.ContactPhone);

        await _templateRepository.AddAsync(template, cancellationToken);
        await _templateRepository.SaveChangesAsync(cancellationToken);

        return template.Id;
    }
}