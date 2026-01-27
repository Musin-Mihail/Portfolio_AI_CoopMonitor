using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using Microsoft.EntityFrameworkCore;
using Quartz;
using System.Text;

namespace CoopMonitor.API.Jobs;

[DisallowConcurrentExecution]
public class DailyReportJob : IJob
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<DailyReportJob> _logger;

    public DailyReportJob(IServiceProvider serviceProvider, ILogger<DailyReportJob> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    public async Task Execute(IJobExecutionContext context)
    {
        _logger.LogInformation("Starting DailyReportJob...");

        // Quartz jobs are singletons in some configs, but DbContext is Scoped.
        // Need to create a scope.
        using var scope = _serviceProvider.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var reportGenerator = scope.ServiceProvider.GetRequiredService<IReportGenerator>();
        var fileStorage = scope.ServiceProvider.GetRequiredService<IFileStorageService>();
        var calculationService = scope.ServiceProvider.GetRequiredService<ICalculationService>();

        // Определяем дату отчета (вчерашний день, так как отчет запускается утром)
        // Если запущено вручную, можно передать дату через JobDataMap
        DateTime reportDate = DateTime.UtcNow.Date.AddDays(-1);
        if (context.MergedJobDataMap.Contains("Date"))
        {
            reportDate = context.MergedJobDataMap.GetDateTime("Date").Date;
        }

        var houses = await dbContext.Houses.ToListAsync();

        foreach (var house in houses)
        {
            try
            {
                await ProcessHouseReportAsync(house, reportDate, dbContext, reportGenerator, fileStorage, calculationService);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating report for House {HouseId}", house.Id);
            }
        }
    }

    private async Task ProcessHouseReportAsync(
        House house,
        DateTime date,
        CoopContext db,
        IReportGenerator generator,
        IFileStorageService storage,
        ICalculationService calculationService)
    {
        _logger.LogInformation("Generating daily report for House {HouseId} for {Date}", house.Id, date);

        // 1. Сбор данных
        var mortality = await db.MortalityRecords
            .Where(m => m.HouseId == house.Id && m.Date.Date == date)
            .SumAsync(m => m.Quantity);

        var feedWater = await db.FeedWaterRecords
            .Where(fw => fw.HouseId == house.Id && fw.Date.Date == date)
            .ToListAsync();

        double feedKg = feedWater.Sum(x => x.FeedQuantityKg);
        double waterL = feedWater.Sum(x => x.WaterQuantityLiters);

        // Климат за сутки
        var sensors = await db.SensorReadings
            .Where(s => s.HouseId == house.Id && s.Date >= date && s.Date < date.AddDays(1))
            .ToListAsync();

        double avgTemp = sensors.Any() ? sensors.Average(s => s.Temperature) : 0;
        double avgHum = sensors.Any() ? sensors.Average(s => s.Humidity) : 0;

        // Time in range logic (duplicate from CalculationService somewhat, but historically scoped)
        // Для отчета можно вызвать CalculationService если там есть метод получения исторических данных,
        // но GetHouseSummaryAsync работает на "сейчас". 
        // Упрощенный расчет:
        double target = 30.0;
        int inRangeCount = sensors.Count(t => t.Temperature >= target - 1.0 && t.Temperature <= target + 1.0);
        double timeInRange = sensors.Any() ? (double)inRangeCount / sensors.Count * 100 : 0;

        // Популяция
        var totalDead = await db.MortalityRecords
            .Where(m => m.HouseId == house.Id && m.Date.Date <= date)
            .SumAsync(m => m.Quantity);
        int population = house.Capacity - totalDead;

        // Alerts (Example)
        var alerts = new List<string>();
        if (mortality > 15) alerts.Add($"High mortality detected: {mortality}");
        if (avgTemp > 32) alerts.Add($"High average temperature: {avgTemp:F1}");

        // 2. Создание модели
        var model = new DailyReportModel
        {
            Title = "Daily Farm Report",
            HouseName = house.Name,
            Date = date,
            DayOfCycle = 20, // Mock
            MortalityCount = mortality,
            TotalPopulation = population,
            FeedConsumedKg = feedKg,
            WaterConsumedLiters = waterL,
            AvgTemp = avgTemp,
            AvgHumidity = avgHum,
            TimeInRangePercent = timeInRange,
            Alerts = alerts
        };

        // 3. Генерация HTML
        string htmlContent = await generator.GenerateReportHtmlAsync("DailyReport", model);
        byte[] htmlBytes = Encoding.UTF8.GetBytes(htmlContent);

        // 4. Загрузка в MinIO
        string fileName = $"Daily_House{house.Id}_{date:yyyyMMdd}.html";
        using (var stream = new MemoryStream(htmlBytes))
        {
            await storage.UploadFileAsync("reports", fileName, stream, "text/html");
        }

        // 5. Запись в БД
        var reportRecord = new ReportMetadata
        {
            HouseId = house.Id,
            ReportType = "Daily",
            ReportDate = date,
            GeneratedAt = DateTime.UtcNow,
            FilePath = fileName, // В бакете "reports"
            Status = "Success"
        };

        db.Reports.Add(reportRecord);
        await db.SaveChangesAsync();

        _logger.LogInformation("Report {FileName} created successfully.", fileName);
    }
}