namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record SubmitSurveyDto(
        int Rating,
        string? Comment);
}
