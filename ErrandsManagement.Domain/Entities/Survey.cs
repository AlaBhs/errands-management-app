using ErrandsManagement.Domain.Common;

namespace ErrandsManagement.Domain.Entities;

public class Survey : BaseEntity
{
    public Guid RequestId { get; private set; }

    public int Rating { get; private set; }
    public string? Comment { get; private set; }
    public DateTime SubmittedAt { get; private set; }

    private Survey() { }

    public Survey(Guid requestId, int rating, string? comment)
    {
        RequestId = requestId;
        Rating = rating;
        Comment = comment;
        SubmittedAt = DateTime.UtcNow;
    }
}