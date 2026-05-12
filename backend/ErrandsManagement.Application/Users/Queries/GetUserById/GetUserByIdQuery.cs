using ErrandsManagement.Application.Users.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Users.Queries.GetUserById;

public sealed record GetUserByIdQuery(Guid UserId) : IRequest<UserListItemDto>;