
using MediatR;

namespace ErrandsManagement.Application.Requests.Commands.SubmitSurvey
{
    public sealed record SubmitSurveyCommand(
        Guid RequestId,
        int Rating,
        string? Comment) : IRequest;
}
