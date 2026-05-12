namespace ErrandsManagement.Application.Requests.DTOs
{
    public sealed record SurveyDto(
        int Rating,
        string? Comment);
}
