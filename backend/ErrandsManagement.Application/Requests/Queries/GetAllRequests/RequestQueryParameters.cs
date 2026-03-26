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
        public bool IsOverdue { get; init; } = false;
        public bool? HasSurvey { get; init; }
        public DateTime? From { get; init; } = null;
        public DateTime? To { get; init; } = null;
    }
}
