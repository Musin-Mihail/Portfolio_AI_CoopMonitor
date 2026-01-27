using CoopMonitor.API.Services;
using Quartz;

namespace CoopMonitor.API.Jobs;

[DisallowConcurrentExecution]
public class CleanupJob : IJob
{
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<CleanupJob> _logger;
    private const string LogsFolder = "Logs";

    public CleanupJob(IFileStorageService fileStorage, ILogger<CleanupJob> logger)
    {
        _fileStorage = fileStorage;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting CleanupJob...");

        // 1. MinIO: Raw Video (> 90 дней)
        try
        {
            var deletedCount = await _fileStorage.CleanupOldFilesAsync("raw-video", TimeSpan.FromDays(90));
            _logger.LogInformation("Cleaned up {Count} files from 'raw-video' (older than 90 days).", deletedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning bucket 'raw-video'");
        }

        // 2. MinIO: Reports (> 365 дней)
        try
        {
            var deletedCount = await _fileStorage.CleanupOldFilesAsync("reports", TimeSpan.FromDays(365));
            _logger.LogInformation("Cleaned up {Count} files from 'reports' (older than 365 days).", deletedCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning bucket 'reports'");
        }

        // 3. MinIO: System/Audit Logs (если хранятся там) - пока нет
        // 4. Local: Serilog Files (> 90 дней)
        try
        {
            if (Directory.Exists(LogsFolder))
            {
                var directory = new DirectoryInfo(LogsFolder);
                var oldLogs = directory.GetFiles("coop-monitor-*.log")
                    .Where(f => f.LastWriteTimeUtc < DateTime.UtcNow.AddDays(-90))
                    .ToList();

                foreach (var logFile in oldLogs)
                {
                    logFile.Delete();
                    _logger.LogInformation("Deleted old local log: {Name}", logFile.Name);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error cleaning local logs.");
        }

        _logger.LogInformation("CleanupJob finished.");
    }
}