using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services.Notifications;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services.Alerting;

public class AlertService : IAlertService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly INotificationService _notificationService;
    private readonly ILogger<AlertService> _logger;

    public AlertService(
        IServiceProvider serviceProvider,
        INotificationService notificationService,
        ILogger<AlertService> logger)
    {
        _serviceProvider = serviceProvider;
        _notificationService = notificationService;
        _logger = logger;
    }

    public async Task<List<string>> GetActiveAlertsAsync(int houseId)
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CoopContext>();

        var alerts = new List<string>();
        var today = DateTime.UtcNow.Date;

        // 1. Климат
        var lastReading = await context.SensorReadings
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.Date)
            .FirstOrDefaultAsync();

        if (lastReading != null)
        {
            // Проверка свежести данных (если данные старше 15 минут)
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

        // 2. Падеж
        var deadToday = await context.MortalityRecords
            .Where(m => m.HouseId == houseId && m.Date.Date == today)
            .SumAsync(m => m.Quantity);

        if (deadToday > 15) // Порог заглушка, в идеале % от поголовья
        {
            alerts.Add($"High Mortality Alert ({deadToday} birds today)");
        }

        return alerts;
    }

    public async Task CheckSensorIngestionAsync(int houseId, SensorReading reading)
    {
        // Проверка критических значений для пуш-уведомлений
        // Отправляем пуш только если это действительно КРИТИЧНО, чтобы не спамить

        var criticalAlerts = new List<string>();

        if (reading.Temperature > 35.0)
            criticalAlerts.Add($"🔥 CRITICAL High Temp: {reading.Temperature:F1}°C");

        if (reading.Temperature < 15.0)
            criticalAlerts.Add($"❄️ CRITICAL Low Temp: {reading.Temperature:F1}°C");

        if (reading.Nh3 > 25.0)
            criticalAlerts.Add($"☣️ CRITICAL Ammonia: {reading.Nh3:F1} ppm");

        if (criticalAlerts.Count > 0)
        {
            string details = string.Join("\n", criticalAlerts);
            await _notificationService.SendAlertAsync($"House #{houseId} Sensor Alert", details);
            _logger.LogWarning("Critical sensor alert sent for House {HouseId}", houseId);
        }
    }
}