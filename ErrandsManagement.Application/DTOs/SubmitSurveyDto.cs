
namespace ErrandsManagement.Application.DTOs
{
    public sealed record SubmitSurveyDto(
        int Rating,
        string? Comment);
}
