namespace CoopMonitor.API.Services;

public interface IAuditService
{
    Task LogAsync(string? userId, string? userName, string action, string? resource, string? details = null, string? ipAddress = null);
}