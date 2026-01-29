using CoopMonitor.API.DTOs;

namespace CoopMonitor.API.Services.SaaS;

public interface ISaaSService
{
    Task<bool> CanUploadAsync(long bytes);
    Task RecordUsageAsync(long bytes);
    Task<bool> UploadReportAsync(string fileName, Stream content);
    Task CheckForUpdatesAsync();
    Task<SaaSStatusDto> GetStatusAsync();
}