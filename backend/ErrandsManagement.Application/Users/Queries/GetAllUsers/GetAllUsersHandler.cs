using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.Users.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Users.Queries.GetAllUsers;

public sealed class GetAllUsersHandler
    : IRequestHandler<GetAllUsersQuery, PagedResult<UserListItemDto>>
{
    private readonly IUserRepository _userRepository;

    public GetAllUsersHandler(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<PagedResult<UserListItemDto>> Handle(
        GetAllUsersQuery request,
        CancellationToken cancellationToken)
    {
        return await _userRepository.GetPagedAsync(request.Parameters, cancellationToken);
    }
}