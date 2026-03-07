using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Common.Exceptions;

namespace ErrandsManagement.Domain.Entities;

public class Survey : BaseEntity
{
    public Guid RequestId { get; private set; }

    public int Rating { get; private set; }
    public string? Comment { get; private set; }
    public DateTime SubmittedAt { get; private set; }

    private Survey() { }

    public Survey(int rating, string? comment)
    {
        if (rating < 1 || rating > 5)
            throw new SurveyNotAllowedException("Rating must be between 1 and 5.");

        Rating = rating;
        Comment = comment;
        SubmittedAt = DateTime.UtcNow;
    }
}