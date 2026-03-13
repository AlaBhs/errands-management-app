using ErrandsManagement.Application.Requests.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Requests.Queries.GetRequestById
{
    public sealed record GetRequestByIdQuery(Guid Id) : IRequest<RequestDetailsDto>;
}
