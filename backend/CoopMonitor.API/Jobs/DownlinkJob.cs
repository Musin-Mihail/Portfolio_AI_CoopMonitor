using CoopMonitor.API.Services.SaaS;
using Quartz;

namespace CoopMonitor.API.Jobs;

[DisallowConcurrentExecution]
public class DownlinkJob : IJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DownlinkJob> _logger;

    public DownlinkJob(IServiceProvider serviceProvider, ILogger<DownlinkJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting DownlinkJob...");

        try
        {
            using var scope = _serviceProvider.CreateScope();
            var saas = scope.ServiceProvider.GetRequiredService<ISaaSService>();

            await saas.CheckForUpdatesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during DownlinkJob");
        }
    }
}