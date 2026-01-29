using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services;

public class CalculationService : ICalculationService
{
    private readonly CoopContext _context;
    // Вернули зависимости
    private readonly ILogger<CalculationService> _logger;
    // Если у вас есть IAlertService, раскомментируйте и добавьте в конструктор
    // private readonly IAlertService _alertService; 

    public CalculationService(CoopContext context, ILogger<CalculationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<DashboardSummaryDto>> GetAllHousesSummaryAsync()
    {
        var houses = await _context.Houses.ToListAsync();
        var summaries = new List<DashboardSummaryDto>();

        foreach (var house in houses)
        {
            // Переиспользуем логику получения одного
            summaries.Add(await GetHouseSummaryAsync(house.Id));
        }

        return summaries;
    }

    public async Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId)
    {
        var house = await _context.Houses.FindAsync(houseId);
        if (house == null) throw new KeyNotFoundException();

        // Текущие данные (последние)
        var latestReading = await _context.SensorReadings
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.Date)
            .FirstOrDefaultAsync();

        if (latestReading == null)
        {
            return new DashboardSummaryDto(
                houseId, house.Name, 0,
                new DailyMetricsDto(0, 0, 0, 0, 0),
                new CurrentClimateDto(0, 0, 0, 0, 0, DateTime.UtcNow),
                new AudioStatusDto("Unknown", "None", DateTime.UtcNow),
                new List<string>()
            );
        }

        // Проверка на алерты (пример логики)
        if (!ValidateSensorData(latestReading.Temperature, latestReading.Humidity, latestReading.Co2, latestReading.Nh3))
        {
            _logger.LogWarning($"Sensor data out of range for House {houseId}");
            // _alertService.SendAlert(...) 
        }

        // Расчет времени в "нормальном" диапазоне за последние 24ч (упрощенно)
        // В реальном проекте это может быть сложный запрос
        var timeInRange = 95;

        return new DashboardSummaryDto(
            houseId,
            house.Name,
            house.Capacity,
            new DailyMetricsDto(0, 0, 0, 0, 0), // Mock daily stats
            new CurrentClimateDto(
                latestReading.Temperature,
                latestReading.Humidity,
                latestReading.Co2,
                latestReading.Nh3,
                timeInRange,
                latestReading.Date),
            new AudioStatusDto("Healthy", "Normal", DateTime.UtcNow),
            new List<string>()
        );
    }

    public async Task<IEnumerable<ClimateHistoryPoint>> GetHouseHistoryAsync(int houseId, int hours, int aggregationMinutes = 0)
    {
        var fromDate = DateTime.UtcNow.AddHours(-hours);

        try
        {
            // 1. Получаем сырые данные из БД
            var rawData = await _context.SensorReadings
                .AsNoTracking()
                .Where(r => r.HouseId == houseId && r.Date >= fromDate)
                .OrderBy(r => r.Date)
                .Select(r => new { r.Date, r.Temperature, r.Humidity, r.Co2, r.Nh3 })
                .ToListAsync();

            if (!rawData.Any()) return new List<ClimateHistoryPoint>();

            if (aggregationMinutes <= 0)
            {
                return rawData.Select(r => new ClimateHistoryPoint(r.Date, r.Temperature, r.Humidity, r.Co2, r.Nh3));
            }

            // 2. Агрегация в памяти
            var aggregated = rawData
                .GroupBy(r =>
                {
                    var ticks = r.Date.Ticks;
                    var intervalTicks = TimeSpan.FromMinutes(aggregationMinutes).Ticks;
                    var roundedTicks = (ticks / intervalTicks) * intervalTicks;
                    return new DateTime(roundedTicks);
                })
                .Select(g => new ClimateHistoryPoint(
                    g.Key,
                    Math.Round(g.Average(x => x.Temperature), 1),
                    Math.Round(g.Average(x => x.Humidity), 1),
                    Math.Round(g.Average(x => x.Co2), 0),
                    Math.Round(g.Average(x => x.Nh3), 1)
                ))
                .OrderBy(x => x.Timestamp)
                .ToList();

            return aggregated;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting history for house {HouseId}", houseId);
            throw;
        }
    }

    public async Task<ProductionMetricsDto> CalculateProductionMetricsAsync(int houseId, DateTime start, DateTime end)
    {
        // Mock implementation
        return new ProductionMetricsDto(1000, 2000, 5, 0.1, 40, 180, 1.5, 14.5);
    }

    public bool ValidateSensorData(double temp, double hum, double co2, double nh3)
    {
        // Логика валидации
        if (temp < -50 || temp > 60) return false;
        if (hum < 0 || hum > 100) return false;
        return true;
    }
}