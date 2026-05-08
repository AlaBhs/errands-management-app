using ErrandsManagement.Application.Interfaces;
using ErrandsManagement.Application.OperationalReports.DTOs;
using MediatR;

namespace ErrandsManagement.Application.OperationalReports.Queries.GetOperationalReports;

public sealed class GetOperationalReportsHandler
    : IRequestHandler<GetOperationalReportsQuery, IReadOnlyList<OperationalReportSummaryDto>>
{
    private readonly IOperationalReportRepository _repository;

    public GetOperationalReportsHandler(IOperationalReportRepository repository)
    {
        _repository = repository;
    }

    public async Task<IReadOnlyList<OperationalReportSummaryDto>> Handle(
        GetOperationalReportsQuery request,
        CancellationToken cancellationToken)
    {
        var reports = await _repository.GetAllAsync(cancellationToken);

        return reports
            .OrderByDescending(r => r.GeneratedAt)
            .Select(r => new OperationalReportSummaryDto(
                r.Id,
                r.GeneratedAt,
                r.PeriodFrom,
                r.PeriodTo,
                r.AiUnavailable))
            .ToList()
            .AsReadOnly();
    }
}
