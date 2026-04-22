using ErrandsManagement.Application.Requests.Queries.GetAtRiskRequests;
using ErrandsManagement.Domain.Events;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace ErrandsManagement.Infrastructure.BackgroundJobs;

/// <summary>
/// Runs every 5 minutes, detects at-risk requests, and publishes
/// RequestAtRiskEvent for each one. Contains ZERO business logic —
/// all detection and notification logic lives in the Application layer.
/// </summary>
public sealed class DeadlineMonitoringService : BackgroundService
{
    private static readonly TimeSpan Interval = TimeSpan.FromMinutes(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<DeadlineMonitoringService> _logger;

    public DeadlineMonitoringService(
        IServiceScopeFactory scopeFactory,
        ILogger<DeadlineMonitoringService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "[DeadlineMonitor] Service started. Interval: {Interval}.", Interval);

        // Delay first run slightly to let the app finish startup
        await Task.Delay(TimeSpan.FromSeconds(15), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            await RunCycleAsync(stoppingToken);
            await Task.Delay(Interval, stoppingToken);
        }
    }

    private async Task RunCycleAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation(
            "[DeadlineMonitor] Scanning for at-risk requests at {Time}.", DateTime.UtcNow);

        // BackgroundService is Singleton — scoped services MUST be resolved per cycle
        await using var scope = _scopeFactory.CreateAsyncScope();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        try
        {
            var atRiskRequests = await mediator.Send(
                new GetAtRiskRequestsQuery(), stoppingToken);

            _logger.LogInformation(
                "[DeadlineMonitor] Found {Count} at-risk request(s).", atRiskRequests.Count);

            foreach (var request in atRiskRequests)
            {
                await mediator.Publish(
                    new RequestAtRiskEvent(
                        request.RequestId,
                        request.Title,
                        request.Deadline,
                        request.RequesterId,
                        request.AssignedCourierId),
                    stoppingToken);
            }
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // Log and continue — a single cycle failure must not crash the host
            _logger.LogError(ex,
                "[DeadlineMonitor] Unhandled error during scan cycle. Will retry in {Interval}.",
                Interval);
        }
    }
}