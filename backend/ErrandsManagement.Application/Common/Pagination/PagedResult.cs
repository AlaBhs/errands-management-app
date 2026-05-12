

namespace ErrandsManagement.Application.Common.Pagination
{
    public sealed class PagedResult<T>
    {
        public IReadOnlyCollection<T> Items { get; init; } = [];
        public int Page { get; init; }
        public int PageSize { get; init; }
        public int TotalCount { get; init; }
        public int TotalPages { get; init; }

        public static PagedResult<T> Create(
            IReadOnlyCollection<T> items,
            int page,
            int pageSize,
            int totalCount)
        {
            return new PagedResult<T>
            {
                Items = items,
                Page = page,
                PageSize = pageSize,
                TotalCount = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };
        }
    }
}
