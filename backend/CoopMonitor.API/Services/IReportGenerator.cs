namespace CoopMonitor.API.Services;

public interface IReportGenerator
{
    /// <summary>
    /// Генерирует HTML контент отчета на основе модели данных.
    /// </summary>
    /// <typeparam name="TModel">Тип модели данных для шаблона.</typeparam>
    /// <param name="templateKey">Ключ шаблона (или имя файла).</param>
    /// <param name="model">Данные.</param>
    /// <returns>HTML строка.</returns>
    Task<string> GenerateReportHtmlAsync<TModel>(string templateKey, TModel model);
}

public class DailyReportModel
{
    public string Title { get; set; } = string.Empty;
    public string HouseName { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public int DayOfCycle { get; set; }

    public int MortalityCount { get; set; }
    public int TotalPopulation { get; set; }
    public double FeedConsumedKg { get; set; }
    public double WaterConsumedLiters { get; set; }

    public double AvgTemp { get; set; }
    public double AvgHumidity { get; set; }
    public double TimeInRangePercent { get; set; }

    public List<string> Alerts { get; set; } = new();
}

public class WeeklyReportModel
{
    public string Title { get; set; } = string.Empty;
    public string HouseName { get; set; } = string.Empty;
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public int WeekNumber { get; set; }

    public double StartWeight { get; set; }
    public double EndWeight { get; set; }
    public double WeightGain { get; set; }
    public double FCR { get; set; }
    public double StockingDensity { get; set; }

    public double TotalFeed { get; set; }
    public double TotalWater { get; set; }
    public int TotalMortality { get; set; }
    public double MortalityRate { get; set; }

    public double AvgTemp { get; set; }
    public double AvgHumidity { get; set; }
}