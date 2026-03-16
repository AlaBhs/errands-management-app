using ErrandsManagement.Application.Common.Pagination;
using ErrandsManagement.Domain.Enums;


namespace ErrandsManagement.Application.Requests.Queries.GetAllRequests
{
    public sealed class RequestQueryParameters : PaginationParameters
    {
        public RequestStatus? Status { get; init; }

        public RequestCategory? Category { get; init; }

        public string? Search { get; init; }

        public string? SortBy { get; init; }

        public bool Descending { get; init; } = false;
    }
}
