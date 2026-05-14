using ErrandsManagement.Application.OperationalReports.DTOs;
using MediatR;

namespace ErrandsManagement.Application.OperationalReports.Queries.GetOperationalReports;

public sealed record GetOperationalReportsQuery : IRequest<IReadOnlyList<OperationalReportSummaryDto>>;
