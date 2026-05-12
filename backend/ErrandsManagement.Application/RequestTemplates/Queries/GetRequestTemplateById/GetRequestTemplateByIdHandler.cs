using ErrandsManagement.Application.Common.Exceptions;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Requests.DTOs;
using ErrandsManagement.Application.RequestTemplates.DTOs;
using ErrandsManagement.Domain.Entities;
using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Queries.GetRequestTemplateById;

public sealed class GetRequestTemplateByIdHandler
    : IRequestHandler<GetRequestTemplateByIdQuery, RequestTemplateDetailsDto>
{
    private readonly IRequestTemplateRepository _repository;

    public GetRequestTemplateByIdHandler(IRequestTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<RequestTemplateDetailsDto> Handle(
        GetRequestTemplateByIdQuery query,
        CancellationToken cancellationToken)
    {
        var template = await _repository.GetByIdAsync(query.TemplateId, cancellationToken)
            ?? throw new NotFoundException(nameof(RequestTemplate), query.TemplateId);

        if (template.CreatedBy != query.UserId)
            throw new ForbiddenAccessException("You do not have access to this template.");

        return new RequestTemplateDetailsDto(
            template.Id,
            template.Name,
            template.Title,
            template.Description,
            template.Category.ToString(),
            new AddressDto(
                template.Address.City,
                template.Address.PostalCode,
                template.Address.Country,
                template.Address.Street,
                template.Address.Note,
                template.Address.Latitude,
                template.Address.Longitude),
            template.EstimatedCost,
            template.ContactPerson,
            template.ContactPhone,
            template.CreatedAt);
    }
}