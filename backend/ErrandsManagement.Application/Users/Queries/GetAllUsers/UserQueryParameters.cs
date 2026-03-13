using ErrandsManagement.Application.Common.Pagination;

namespace ErrandsManagement.Application.Users.Queries.GetAllUsers;

public sealed class UserQueryParameters : PaginationParameters
{
    public string? Role { get; init; }
    public string? Search { get; init; }
}