using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services.Alerting;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services;

public class CalculationService : ICalculationService
{
    private readonly CoopContext _context;
    private readonly IAlertService _alertService;
    private readonly ILogger<CalculationService> _logger;

    public CalculationService(CoopContext context, IAlertService alertService, ILogger<CalculationService> logger)
    {
        _context = context;
        _alertService = alertService;
        _logger = logger;
    }

    public async Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId)
    {
        var house = await _context.Houses.FindAsync(houseId);
        if (house == null) throw new KeyNotFoundException($"House {houseId} not found");

        var today = DateTime.UtcNow.Date;
        var now = DateTime.UtcNow;

        // 1. Падеж сегодня
        var mortalityRecords = await _context.MortalityRecords
            .Where(m => m.HouseId == houseId && m.Date.Date == today)
            .ToListAsync();

        int deadToday = mortalityRecords.Sum(m => m.Quantity);

        // Примерная популяция
        var totalDead = await _context.MortalityRecords
            .Where(m => m.HouseId == houseId)
            .SumAsync(m => m.Quantity);

        int currentPopulation = Math.Max(0, house.Capacity - totalDead);
        double mortalityRate = currentPopulation > 0 ? (double)deadToday / currentPopulation * 100 : 0;

        // 2. Корм/Вода сегодня
        var feedWater = await _context.FeedWaterRecords
            .Where(r => r.HouseId == houseId && r.Date.Date == today)
            .ToListAsync();

        double feedKg = feedWater.Sum(r => r.FeedQuantityKg);
        double waterL = feedWater.Sum(r => r.WaterQuantityLiters);

        // 3. Последние данные климата
        var lastReading = await _context.SensorReadings
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.Date)
            .FirstOrDefaultAsync();

        // 4. Time-in-Range (за последние 24 часа)
        var dayAgo = now.AddHours(-24);
        var last24hReadings = await _context.SensorReadings
            .Where(r => r.HouseId == houseId && r.Date >= dayAgo)
            .Select(r => r.Temperature)
            .ToListAsync();

        double timeInRange = 0;
        if (last24hReadings.Count > 0)
        {
            double target = 30.0;
            int inRangeCount = last24hReadings.Count(t => t >= target - 1.0 && t <= target + 1.0);
            timeInRange = (double)inRangeCount / last24hReadings.Count * 100;
        }

        // 5. ADG (Привес)
        double? adg = null;
        var weighings = await _context.WeighingRecords
            .Where(w => w.HouseId == houseId)
            .OrderByDescending(w => w.Date)
            .Take(2)
            .ToListAsync();

        if (weighings.Count == 2)
        {
            var current = weighings[0];
            var prev = weighings[1];
            var daysDiff = (current.Date - prev.Date).TotalDays;
            if (daysDiff > 0)
            {
                adg = (current.WeightGrams - prev.WeightGrams) / daysDiff;
            }
        }

        // 6. Алерты (используем централизованный сервис)
        var alerts = await _alertService.GetActiveAlertsAsync(houseId);

        return new DashboardSummaryDto(
            HouseId: house.Id,
            HouseName: house.Name,
            DayOfCycle: 20,
            TodayMetrics: new DailyMetricsDto(
                MortalityCount: deadToday,
                MortalityRatePercent: Math.Round(mortalityRate, 3),
                FeedConsumedKg: feedKg,
                WaterConsumedLiters: waterL,
                EstimatedADG: adg.HasValue ? Math.Round(adg.Value, 1) : null
            ),
            CurrentClimate: new CurrentClimateDto(
                Temperature: lastReading?.Temperature ?? 0,
                Humidity: lastReading?.Humidity ?? 0,
                Co2: lastReading?.Co2 ?? 0,
                Nh3: lastReading?.Nh3 ?? 0,
                TimeInRangePercent: Math.Round(timeInRange, 1),
                LastUpdate: lastReading?.Date ?? DateTime.MinValue
            ),
            ActiveAlerts: alerts
        );
    }

    public bool ValidateSensorData(double temp, double humidity, double co2, double nh3)
    {
        if (temp < -50 || temp > 60) return false;
        if (humidity < 0 || humidity > 100) return false;
        if (co2 <= 0 && nh3 <= 0) return false;
        return true;
    }
}