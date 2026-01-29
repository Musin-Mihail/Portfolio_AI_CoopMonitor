using CoopMonitor.API.Data;
using CoopMonitor.API.Models;

namespace CoopMonitor.API.Services;

public class AuditService : IAuditService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<AuditService> _logger;

    public AuditService(IServiceProvider serviceProvider, ILogger<AuditService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task LogAsync(string? userId, string? userName, string action, string? resource, string? details = null, string? ipAddress = null)
    {
        try
        {
            using var scope = _serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<CoopContext>();

            var log = new AuditLog
            {
                UserId = userId,
                UserName = userName ?? "System",
                Action = action,
                Resource = resource,
                Details = details,
                IpAddress = ipAddress,
                Timestamp = DateTime.UtcNow
            };

            context.AuditLogs.Add(log);
            await context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to write Audit Log: {Action} by {User}", action, userName);
        }
    }
}