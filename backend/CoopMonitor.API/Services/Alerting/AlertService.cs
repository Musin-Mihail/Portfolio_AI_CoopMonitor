using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services.Notifications;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services.Alerting;

public class AlertService : IAlertService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly INotificationRouter _notificationRouter;
    private readonly ILogger<AlertService> _logger;

    public AlertService(
        IServiceProvider serviceProvider,
        INotificationRouter notificationRouter,
        ILogger<AlertService> logger)
    {
        _serviceProvider = serviceProvider;
        _notificationRouter = notificationRouter;
        _logger = logger;
    }

    public async Task<List<string>> GetActiveAlertsAsync(int houseId)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CoopContext>();

        var alerts = new List<string>();
        var today = DateTime.UtcNow.Date;

        var lastReading = await context.SensorReadings
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.Date)
            .FirstOrDefaultAsync();

        if (lastReading != null)
        {
            if ((DateTime.UtcNow - lastReading.Date).TotalMinutes > 15)
            {
                alerts.Add($"Data Obsolete (Last: {lastReading.Date:HH:mm})");
            }

            if (lastReading.Temperature > 33) alerts.Add("High Temperature Warning (> 33°C)");
            if (lastReading.Temperature < 18) alerts.Add("Low Temperature Warning (< 18°C)");
            if (lastReading.Co2 > 3000) alerts.Add("High CO2 Level (> 3000 ppm)");
            if (lastReading.Nh3 > 20) alerts.Add("High Ammonia Level (> 20 ppm)");
            if (!lastReading.IsValid) alerts.Add("Sensor Malfunction Detected");
        }
        else
        {
            alerts.Add("No Sensor Data");
        }

        var deadToday = await context.MortalityRecords
            .Where(m => m.HouseId == houseId && m.Date.Date == today)
            .SumAsync(m => m.Quantity);

        if (deadToday > 15)
        {
            alerts.Add($"High Mortality Alert ({deadToday} birds today)");
        }

        var lastAudio = await context.AudioEvents
            .Where(a => a.HouseId == houseId)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        if (lastAudio != null && (DateTime.UtcNow - lastAudio.Timestamp).TotalHours < 1)
        {
            if (lastAudio.Classification == "Unhealthy" || lastAudio.Classification == "Panic")
            {
                alerts.Add($"Audio Warning: {lastAudio.Classification} detected");
            }
        }

        return alerts;
    }

    public async Task CheckSensorIngestionAsync(int houseId, SensorReading reading)
    {
        var criticalAlerts = new List<string>();
        var warningAlerts = new List<string>();

        if (reading.Temperature > 35.0) criticalAlerts.Add($"🔥 CRITICAL High Temp: {reading.Temperature:F1}°C");
        if (reading.Temperature < 15.0) criticalAlerts.Add($"❄️ CRITICAL Low Temp: {reading.Temperature:F1}°C");
        if (reading.Nh3 > 25.0) criticalAlerts.Add($"☣️ CRITICAL Ammonia: {reading.Nh3:F1} ppm");

        if (reading.Co2 > 2500 && reading.Co2 < 3000) warningAlerts.Add($"⚠️ High CO2: {reading.Co2:F0} ppm");

        if (criticalAlerts.Count > 0)
        {
            string details = string.Join("\n", criticalAlerts);
            await _notificationRouter.RouteAlertAsync($"House #{houseId} Critical Sensor Alert", details, AlertSeverity.Critical);
            _logger.LogWarning("Critical sensor alert routed for House {HouseId}", houseId);
        }

        if (warningAlerts.Count > 0)
        {
            string details = string.Join("\n", warningAlerts);
            await _notificationRouter.RouteAlertAsync($"House #{houseId} Sensor Warning", details, AlertSeverity.Warning);
        }
    }

    public async Task CheckAudioIngestionAsync(int houseId, AudioEvent audioEvent)
    {
        if (audioEvent.Confidence < 0.8) return;

        var severity = AlertSeverity.Warning;
        if (audioEvent.Classification == "Panic") severity = AlertSeverity.Critical;

        if (audioEvent.Classification == "Unhealthy" || audioEvent.Classification == "Panic")
        {
            string msg = $"🔊 Audio Alert: {audioEvent.Classification} detected (Conf: {audioEvent.Confidence:P0})";
            await _notificationRouter.RouteAlertAsync($"House #{houseId} Audio Event", msg, severity);
            _logger.LogInformation("Audio alert routed for House {HouseId}", houseId);
        }
    }
}