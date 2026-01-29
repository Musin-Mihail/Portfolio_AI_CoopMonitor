using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services;

public class CalculationService : ICalculationService
{
    private readonly CoopContext _context;
    private readonly ILogger<CalculationService> _logger;

    public CalculationService(CoopContext context, ILogger<CalculationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<DashboardSummaryDto>> GetAllHousesSummaryAsync()
    {
        var houses = await _context.Houses.AsNoTracking().ToListAsync();
        var summaries = new List<DashboardSummaryDto>();

        foreach (var house in houses)
        {
            summaries.Add(await GetHouseSummaryAsync(house.Id));
        }

        return summaries;
    }

    public async Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId)
    {
        var house = await _context.Houses.FindAsync(houseId);
        if (house == null) throw new KeyNotFoundException();

        var today = DateTime.UtcNow.Date;

        var latestReading = await _context.SensorReadings
            .AsNoTracking()
            .Where(r => r.HouseId == houseId)
            .OrderByDescending(r => r.Date)
            .FirstOrDefaultAsync();

        if (latestReading == null)
        {
            return new DashboardSummaryDto(
                houseId,
                house.Name,
                0,
                new DailyMetricsDto(0, 0, 0, 0, 0),
                new CurrentClimateDto(0, 0, 0, 0, 0, DateTime.UtcNow),
                new AudioStatusDto("Unknown", "None", DateTime.UtcNow),
                new List<string>()
            );
        }

        var alerts = await CheckAlerts(houseId, latestReading);

        var yesterday = DateTime.UtcNow.AddHours(-24);
        var readings24h = await _context.SensorReadings
            .AsNoTracking()
            .Where(r => r.HouseId == houseId && r.Date >= yesterday)
            .Select(r => new { r.Temperature, r.Humidity })
            .ToListAsync();

        int inRangeCount = readings24h.Count(r =>
            r.Temperature >= 18 && r.Temperature <= 33 &&
            r.Humidity >= 40 && r.Humidity <= 70);

        double timeInRange = readings24h.Any() ? (double)inRangeCount / readings24h.Count * 100.0 : 0;

        var mortality = await _context.MortalityRecords
            .AsNoTracking()
            .Where(m => m.HouseId == houseId && m.Date.Date == today)
            .SumAsync(m => m.Quantity);

        var feed = await _context.FeedWaterRecords
            .AsNoTracking()
            .Where(f => f.HouseId == houseId && f.Date.Date == today)
            .SumAsync(f => f.FeedQuantityKg);

        var water = await _context.FeedWaterRecords
            .AsNoTracking()
            .Where(f => f.HouseId == houseId && f.Date.Date == today)
            .SumAsync(f => f.WaterQuantityLiters);

        var lastAudio = await _context.AudioEvents
            .AsNoTracking()
            .Where(a => a.HouseId == houseId)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();

        var audioStatus = new AudioStatusDto(
            Status: lastAudio?.Classification == "Unhealthy" ? "Warning" : "Healthy",
            LastClassification: lastAudio?.Classification ?? "None",
            LastUpdate: lastAudio?.Timestamp ?? DateTime.MinValue
        );

        return new DashboardSummaryDto(
            houseId,
            house.Name,
            24,
            new DailyMetricsDto(mortality, 0.5, feed, water, 0.055),
            new CurrentClimateDto(
                latestReading.Temperature,
                latestReading.Humidity,
                latestReading.Co2,
                latestReading.Nh3,
                Math.Round(timeInRange, 1),
                latestReading.Date
            ),
            audioStatus,
            alerts
        );
    }

    public async Task<IEnumerable<ClimateHistoryPoint>> GetHouseHistoryAsync(int houseId, int hours, int aggregationMinutes)
    {
        try
        {
            var fromDate = DateTime.UtcNow.AddHours(-hours);

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

    public async Task<IEnumerable<ComparisonHistoryDto>> GetComparisonHistoryAsync(string sensorType, int hours, int aggregationMinutes)
    {
        var fromDate = DateTime.UtcNow.AddHours(-hours);
        var houses = await _context.Houses.AsNoTracking().ToListAsync();
        var result = new List<ComparisonHistoryDto>();
        var type = sensorType.ToLower();

        foreach (var house in houses)
        {
            var baseQuery = _context.SensorReadings
                .AsNoTracking()
                .Where(r => r.HouseId == house.Id && r.Date >= fromDate);

            List<(DateTime Date, double Value)> rawData;

            if (type == "humidity")
            {
                rawData = await baseQuery
                    .Select(r => new { r.Date, Val = r.Humidity })
                    .ToListAsync()
                    .ContinueWith(t => t.Result.Select(x => (x.Date, x.Val)).ToList());
            }
            else if (type == "co2")
            {
                rawData = await baseQuery
                    .Select(r => new { r.Date, Val = r.Co2 })
                    .ToListAsync()
                    .ContinueWith(t => t.Result.Select(x => (x.Date, x.Val)).ToList());
            }
            else if (type == "nh3")
            {
                rawData = await baseQuery
                    .Select(r => new { r.Date, Val = r.Nh3 })
                    .ToListAsync()
                    .ContinueWith(t => t.Result.Select(x => (x.Date, x.Val)).ToList());
            }
            else
            {
                rawData = await baseQuery
                    .Select(r => new { r.Date, Val = r.Temperature })
                    .ToListAsync()
                    .ContinueWith(t => t.Result.Select(x => (x.Date, x.Val)).ToList());
            }

            List<HistoryPointDto> points;

            if (aggregationMinutes > 0 && rawData.Any())
            {
                points = rawData
                    .GroupBy(r =>
                    {
                        var ticks = r.Date.Ticks;
                        var intervalTicks = TimeSpan.FromMinutes(aggregationMinutes).Ticks;
                        var roundedTicks = (ticks / intervalTicks) * intervalTicks;
                        return new DateTime(roundedTicks);
                    })
                    .Select(g => new HistoryPointDto(g.Key, Math.Round(g.Average(x => x.Value), 1)))
                    .OrderBy(p => p.Timestamp)
                    .ToList();
            }
            else
            {
                points = rawData
                    .OrderBy(r => r.Date)
                    .Select(r => new HistoryPointDto(r.Date, r.Value))
                    .ToList();
            }

            result.Add(new ComparisonHistoryDto(house.Id, house.Name, points));
        }

        return result;
    }

    public async Task<ProductionMetricsDto> CalculateProductionMetricsAsync(int houseId, DateTime start, DateTime end)
    {
        return new ProductionMetricsDto(1000, 2000, 5, 0.1, 40, 180, 1.5, 14.5);
    }

    public bool ValidateSensorData(double temp, double hum, double co2, double nh3)
    {
        if (temp < -50 || temp > 60) return false;
        if (hum < 0 || hum > 100) return false;
        return true;
    }

    private async Task<List<string>> CheckAlerts(int houseId, SensorReading lastReading)
    {
        var alerts = new List<string>();
        if ((DateTime.UtcNow - lastReading.Date).TotalMinutes > 15)
        {
            alerts.Add($"Data Obsolete (Last: {lastReading.Date:HH:mm})");
        }
        if (lastReading.Temperature > 33) alerts.Add("High Temperature Warning (> 33°C)");
        if (lastReading.Co2 > 3000) alerts.Add("High CO2 Level (> 3000 ppm)");
        if (lastReading.Nh3 > 20) alerts.Add("High Ammonia Level (> 20 ppm)");

        return alerts;
    }
}