using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Users.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Users.Queries.GetAllUsers;

public sealed record GetAllUsersQuery(
    UserQueryParameters Parameters)
    : IRequest<PagedResult<UserListItemDto>>;