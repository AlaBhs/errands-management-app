

namespace ErrandsManagement.Application.Common.Pagination;

public abstract class PaginationParameters
{
    private const int MaxPageSize = 50;

    private int _pageSize = 10;

    public int Page { get; init; } = 1;

    public int PageSize
    {
        get => _pageSize;
        init => _pageSize = value > MaxPageSize ? MaxPageSize : value;
    }
}