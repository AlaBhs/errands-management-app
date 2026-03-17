using ErrandsManagement.Application.Analytics.DTOs;
using MediatR;

namespace ErrandsManagement.Application.Analytics.Queries.GetAnalyticsSummary;

public sealed record GetAnalyticsSummaryQuery : IRequest<AnalyticsSummaryDto>;