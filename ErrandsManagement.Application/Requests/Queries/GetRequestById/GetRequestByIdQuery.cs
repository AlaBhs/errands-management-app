
using ErrandsManagement.Application.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestById
{
    public sealed record GetRequestByIdQuery(Guid Id) : IRequest<RequestDetailsDto>;
}
