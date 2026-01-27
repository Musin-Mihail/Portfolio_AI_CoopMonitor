using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services.SaaS;

public class SaaSService : ISaaSService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SaaSService> _logger;

    // Лимит: 500 МБ в байтах
    private const long DailyLimitBytes = 500 * 1024 * 1024;

    public SaaSService(IServiceProvider serviceProvider, ILogger<SaaSService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task<bool> CanUploadAsync(long bytes)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var today = DateTime.UtcNow.Date;

        var usage = await context.SyncUsages.FirstOrDefaultAsync(u => u.Date == today);
        long currentSent = usage?.BytesSent ?? 0;

        if (currentSent + bytes > DailyLimitBytes)
        {
            _logger.LogWarning("Traffic limit exceeded. Used: {Used} MB, Requested: {Req} MB, Limit: {Limit} MB",
                currentSent / 1024 / 1024, bytes / 1024 / 1024, DailyLimitBytes / 1024 / 1024);
            return false;
        }

        return true;
    }

    public async Task RecordUsageAsync(long bytes)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var today = DateTime.UtcNow.Date;

        var usage = await context.SyncUsages.FirstOrDefaultAsync(u => u.Date == today);
        if (usage == null)
        {
            usage = new SyncUsage { Date = today, BytesSent = 0 };
            context.SyncUsages.Add(usage);
        }

        usage.BytesSent += bytes;
        await context.SaveChangesAsync();
    }

    public async Task<bool> UploadReportAsync(string fileName, Stream content)
    {
        // Mock Implementation
        // В реальности здесь был бы HttpClient.PostAsync("https://cloud-api.coop/upload", content)

        // Симулируем задержку сети
        await Task.Delay(500);

        // Симулируем случайный сбой сети (5% шанс)
        if (new Random().NextDouble() > 0.95)
        {
            _logger.LogError("Simulated network error during upload of {File}", fileName);
            return false;
        }

        _logger.LogInformation("Successfully uploaded {File} to SaaS Cloud. Size: {Size} bytes", fileName, content.Length);
        return true;
    }

    public async Task CheckForUpdatesAsync()
    {
        // Mock Implementation
        _logger.LogInformation("Checking for config updates from SaaS...");
        await Task.Delay(300);
        _logger.LogInformation("No updates available (Mock).");
    }
}