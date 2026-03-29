using ErrandsManagement.Application.Common.Pagination;

namespace ErrandsManagement.Application.Notifications.Queries.GetNotifications
{
    public sealed class NotificationQueryParameters : PaginationParameters
    {
        public bool? UnreadOnly { get; init; }
    }
}
