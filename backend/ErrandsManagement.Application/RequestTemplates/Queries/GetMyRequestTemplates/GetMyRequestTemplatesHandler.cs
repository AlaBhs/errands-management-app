using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.RequestTemplates.DTOs;
using MediatR;

namespace ErrandsManagement.Application.RequestTemplates.Queries.GetMyRequestTemplates;

public sealed class GetMyRequestTemplatesHandler
    : IRequestHandler<GetMyRequestTemplatesQuery, PagedResult<RequestTemplateListItemDto>>
{
    private readonly IRequestTemplateRepository _repository;

    public GetMyRequestTemplatesHandler(IRequestTemplateRepository repository)
    {
        _repository = repository;
    }

    public async Task<PagedResult<RequestTemplateListItemDto>> Handle(
        GetMyRequestTemplatesQuery query,
        CancellationToken cancellationToken)
    {
        return await _repository.GetPagedByUserAsync(
            query.UserId,
            query.Parameters,
            cancellationToken);
    }
}