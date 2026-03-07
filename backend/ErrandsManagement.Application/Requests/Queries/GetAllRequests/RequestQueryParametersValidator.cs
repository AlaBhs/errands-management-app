using FluentValidation;

namespace ErrandsManagement.Application.Requests.Queries.GetAllRequests;

public sealed class RequestQueryParametersValidator
    : AbstractValidator<RequestQueryParameters>
{
    private static readonly string[] AllowedSortFields =
    [
        "createdat",
        "deadline",
        "estimatedcost"
    ];

    public RequestQueryParametersValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1);

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 50);

        RuleFor(x => x.Search)
            .MaximumLength(200)
            .When(x => !string.IsNullOrWhiteSpace(x.Search));

        RuleFor(x => x.SortBy)
            .Must(BeValidSortField)
            .When(x => !string.IsNullOrWhiteSpace(x.SortBy))
            .WithMessage($"SortBy must be one of: {string.Join(", ", AllowedSortFields)}");
    }

    private static bool BeValidSortField(string? sortBy)
    {
        if (string.IsNullOrWhiteSpace(sortBy))
            return true;

        return AllowedSortFields.Contains(
            sortBy.Trim().ToLower());
    }
}
