using CoopMonitor.API.Data;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace CoopMonitor.API.Jobs;

[DisallowConcurrentExecution]
public class BackupJob : IJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<BackupJob> _logger;
    private const string BackupFolder = "Backups";
    private const int RetentionDays = 7;

    public BackupJob(IServiceProvider serviceProvider, ILogger<BackupJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting BackupJob...");

        if (!Directory.Exists(BackupFolder))
        {
            Directory.CreateDirectory(BackupFolder);
        }

        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        var backupFileName = Path.Combine(BackupFolder, $"coop_monitor_{timestamp}.db");

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<CoopContext>();

            var sql = $"VACUUM INTO '{backupFileName}'";
            await dbContext.Database.ExecuteSqlRawAsync(sql);

            _logger.LogInformation("Database backup created successfully: {Path}", backupFileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to create database backup.");
        }

        try
        {
            var directory = new DirectoryInfo(BackupFolder);
            var oldFiles = directory.GetFiles("coop_monitor_*.db")
                .Where(f => f.CreationTimeUtc < DateTime.UtcNow.AddDays(-RetentionDays))
                .ToList();

            foreach (var file in oldFiles)
            {
                file.Delete();
                _logger.LogInformation("Deleted old backup: {Name}", file.Name);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during backup rotation.");
        }
    }
}