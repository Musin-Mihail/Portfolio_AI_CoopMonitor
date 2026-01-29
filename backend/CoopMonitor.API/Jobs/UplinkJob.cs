using CoopMonitor.API.Data;
using CoopMonitor.API.Services;
using CoopMonitor.API.Services.SaaS;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace CoopMonitor.API.Jobs;

[DisallowConcurrentExecution]
public class UplinkJob : IJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<UplinkJob> _logger;

    public UplinkJob(IServiceProvider serviceProvider, ILogger<UplinkJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting UplinkJob (SaaS Sync)...");

        using var scope = _serviceProvider.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var saas = scope.ServiceProvider.GetRequiredService<ISaaSService>();
        var storage = scope.ServiceProvider.GetRequiredService<IFileStorageService>();

        var pendingReports = await db.Reports
            .Where(r => r.Status == "Success" && !r.IsSynced)
            .OrderBy(r => r.GeneratedAt)
            .Take(10)
            .ToListAsync();

        foreach (var report in pendingReports)
        {
            try
            {
                var (stream, contentType, fileName) = await storage.GetFileStreamAsync("reports", report.FilePath);

                long fileSize = stream.Length;
                if (!await saas.CanUploadAsync(fileSize))
                {
                    _logger.LogWarning("Uplink paused due to traffic limits.");
                    break;
                }

                bool success = await saas.UploadReportAsync(report.FilePath, stream);

                if (success)
                {
                    await saas.RecordUsageAsync(fileSize);
                    report.IsSynced = true;
                    report.SyncedAt = DateTime.UtcNow;
                    await db.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to sync report {Id}", report.Id);
            }
        }

        _logger.LogInformation("UplinkJob finished.");
    }
}