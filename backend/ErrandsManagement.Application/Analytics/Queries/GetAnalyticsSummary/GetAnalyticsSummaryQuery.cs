using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;

public sealed record GetAnalyticsSummaryQuery(
    DateTime? From,
    DateTime? To
) : IRequest<AnalyticsSummaryDto>;