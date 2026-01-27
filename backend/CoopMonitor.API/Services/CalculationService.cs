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

        // 3. Климат
        var lastReading = await _context.SensorReadings
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.Date)
            .FirstOrDefaultAsync();

        // 4. Time-in-Range
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

        // 5. ADG
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

        // 6. Аудио статус
        var lastAudio = await _context.AudioEvents
            .Where(a => a.HouseId == houseId)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        var audioDto = new AudioStatusDto("Unknown", "N/A", DateTime.MinValue);
        if (lastAudio != null)
        {
            // Считаем актуальным, если событие было за последний час
            bool isRecent = (DateTime.UtcNow - lastAudio.Timestamp).TotalHours < 1;
            string status = "Unknown";
            if (isRecent)
            {
                status = (lastAudio.Classification == "Healthy" || lastAudio.Classification == "Noise") ? "Healthy" : "Warning";
            }
            audioDto = new AudioStatusDto(status, lastAudio.Classification, lastAudio.Timestamp);
        }

        // 7. Алерты
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
            AudioStatus: audioDto,
            ActiveAlerts: alerts
        );
    }

    public async Task<List<ClimateHistoryPoint>> GetHouseHistoryAsync(int houseId, int hours = 24)
    {
        var cutoff = DateTime.UtcNow.AddHours(-hours);

        var readings = await _context.SensorReadings
            .AsNoTracking()
            .Where(r => r.HouseId == houseId && r.Date >= cutoff)
            .OrderBy(r => r.Date)
            .Select(r => new ClimateHistoryPoint(
                r.Date,
                r.Temperature,
                r.Humidity,
                r.Co2,
                r.Nh3
            ))
            .ToListAsync();

        return readings;
    }

    public async Task<ProductionMetricsDto> CalculateProductionMetricsAsync(int houseId, DateTime startDate, DateTime endDate)
    {
        // Нормализация дат
        startDate = startDate.Date;
        endDate = endDate.Date.AddDays(1).AddTicks(-1);

        // 1. Потребление
        var feedWater = await _context.FeedWaterRecords
            .Where(x => x.HouseId == houseId && x.Date >= startDate && x.Date <= endDate)
            .ToListAsync();

        double totalFeed = feedWater.Sum(x => x.FeedQuantityKg);
        double totalWater = feedWater.Sum(x => x.WaterQuantityLiters);

        // 2. Падеж
        var mortalityList = await _context.MortalityRecords
            .Where(x => x.HouseId == houseId && x.Date >= startDate && x.Date <= endDate)
            .ToListAsync();

        int periodMortality = mortalityList.Sum(x => x.Quantity);

        // Общий падеж до начала периода (для расчета популяции на начало периода)
        var preMortality = await _context.MortalityRecords
            .Where(x => x.HouseId == houseId && x.Date < startDate)
            .SumAsync(x => x.Quantity);

        var house = await _context.Houses.FindAsync(houseId);
        int startPopulation = house != null ? house.Capacity - preMortality : 0;
        int endPopulation = startPopulation - periodMortality;

        double mortalityRate = startPopulation > 0 ? (double)periodMortality / startPopulation * 100.0 : 0;

        // 3. Вес и Биомасса
        // Находим ближайшее взвешивание К началу периода (не позднее 3 дней до или после)
        var startWeighing = await _context.WeighingRecords
            .Where(w => w.HouseId == houseId && w.Date >= startDate.AddDays(-3) && w.Date <= startDate.AddDays(3))
            .OrderBy(w => Math.Abs((w.Date - startDate).TotalSeconds))
            .FirstOrDefaultAsync();

        // Находим ближайшее взвешивание К концу периода
        var endWeighing = await _context.WeighingRecords
            .Where(w => w.HouseId == houseId && w.Date >= endDate.AddDays(-3) && w.Date <= endDate.AddDays(3))
            .OrderBy(w => Math.Abs((w.Date - endDate).TotalSeconds))
            .FirstOrDefaultAsync();

        double startWeight = startWeighing?.WeightGrams ?? 0;
        double endWeight = endWeighing?.WeightGrams ?? 0;

        // 4. FCR (Feed Conversion Ratio) = Feed Consumed / Weight Gain
        // Biomass Gain = (EndPop * EndWeight) - (StartPop * StartWeight)
        // Упрощенный расчет FCR (Field FCR)
        double fcr = 0;
        if (startWeight > 0 && endWeight > 0 && startWeight < endWeight)
        {
            double startBiomassKg = startPopulation * (startWeight / 1000.0);
            double endBiomassKg = endPopulation * (endWeight / 1000.0);
            double gainKg = endBiomassKg - startBiomassKg;

            // Если есть привес, считаем конверсию
            if (gainKg > 0)
            {
                fcr = totalFeed / gainKg;
            }
        }

        // 5. Density (Kg/m2)
        double density = 0;
        if (house != null && house.Area > 0 && endWeight > 0)
        {
            double currentBiomassKg = endPopulation * (endWeight / 1000.0);
            density = currentBiomassKg / house.Area;
        }

        return new ProductionMetricsDto(
            totalFeed,
            totalWater,
            periodMortality,
            Math.Round(mortalityRate, 2),
            startWeight,
            endWeight,
            Math.Round(fcr, 3),
            Math.Round(density, 2)
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