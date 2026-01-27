using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using Microsoft.EntityFrameworkCore;
using Quartz;
using System.Text;

namespace CoopMonitor.API.Jobs;

[DisallowConcurrentExecution]
public class WeeklyReportJob : IJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<WeeklyReportJob> _logger;

    public WeeklyReportJob(IServiceProvider serviceProvider, ILogger<WeeklyReportJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting WeeklyReportJob...");

        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var reportGenerator = scope.ServiceProvider.GetRequiredService<IReportGenerator>();
        var fileStorage = scope.ServiceProvider.GetRequiredService<IFileStorageService>();
        var calcService = scope.ServiceProvider.GetRequiredService<ICalculationService>();

        // Определяем период: последние 7 дней, заканчивая вчерашним
        DateTime endDate = DateTime.UtcNow.Date.AddDays(-1);
        DateTime startDate = endDate.AddDays(-6);

        var houses = await dbContext.Houses.ToListAsync();

        foreach (var house in houses)
        {
            try
            {
                await ProcessHouseWeeklyReportAsync(house, startDate, endDate, dbContext, reportGenerator, fileStorage, calcService);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating weekly report for House {HouseId}", house.Id);
            }
        }
    }

    private async Task ProcessHouseWeeklyReportAsync(
        House house,
        DateTime startDate,
        DateTime endDate,
        CoopContext db,
        IReportGenerator generator,
        IFileStorageService storage,
        ICalculationService calcService)
    {
        _logger.LogInformation("Generating Weekly Report for House {HouseId} ({Start} - {End})", house.Id, startDate, endDate);

        // 1. Получение метрик через CalculationService
        var metrics = await calcService.CalculateProductionMetricsAsync(house.Id, startDate, endDate);

        // 2. Климатические средние
        var sensors = await db.SensorReadings
            .Where(s => s.HouseId == house.Id && s.Date >= startDate && s.Date <= endDate.AddDays(1))
            .ToListAsync();

        double avgTemp = sensors.Any() ? sensors.Average(s => s.Temperature) : 0;
        double avgHum = sensors.Any() ? sensors.Average(s => s.Humidity) : 0;

        // 3. Формирование модели
        var model = new WeeklyReportModel
        {
            Title = "Weekly Performance Report",
            HouseName = house.Name,
            StartDate = startDate,
            EndDate = endDate,
            WeekNumber = System.Globalization.ISOWeek.GetWeekOfYear(endDate),

            StartWeight = metrics.StartWeightGrams,
            EndWeight = metrics.EndWeightGrams,
            WeightGain = metrics.EndWeightGrams - metrics.StartWeightGrams,

            FCR = metrics.FCR,
            StockingDensity = metrics.StockingDensityKgM2,

            TotalFeed = metrics.FeedConsumedKg,
            TotalWater = metrics.WaterConsumedLiters,
            TotalMortality = metrics.MortalityCount,
            MortalityRate = metrics.MortalityRatePercent,

            AvgTemp = avgTemp,
            AvgHumidity = avgHum
        };

        // 4. Генерация HTML
        string html = await generator.GenerateReportHtmlAsync("WeeklyReport", model);
        byte[] bytes = Encoding.UTF8.GetBytes(html);

        // 5. Загрузка в MinIO
        string fileName = $"Weekly_House{house.Id}_{endDate:yyyyMMdd}_W{model.WeekNumber}.html";
        using (var stream = new MemoryStream(bytes))
        {
            await storage.UploadFileAsync("reports", fileName, stream, "text/html");
        }

        // 6. Запись метаданных
        var meta = new ReportMetadata
        {
            HouseId = house.Id,
            ReportType = "Weekly",
            ReportDate = endDate,
            GeneratedAt = DateTime.UtcNow,
            FilePath = fileName,
            Status = "Success"
        };
        db.Reports.Add(meta);
        await db.SaveChangesAsync();

        _logger.LogInformation("Weekly Report {File} created.", fileName);
    }
}