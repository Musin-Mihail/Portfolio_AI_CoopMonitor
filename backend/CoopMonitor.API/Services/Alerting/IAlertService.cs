using CoopMonitor.API.Models;

namespace CoopMonitor.API.Services.Alerting;

public interface IAlertService
{
    Task<List<string>> GetActiveAlertsAsync(int houseId);
    Task CheckSensorIngestionAsync(int houseId, SensorReading reading);
    Task CheckAudioIngestionAsync(int houseId, AudioEvent audioEvent);
}