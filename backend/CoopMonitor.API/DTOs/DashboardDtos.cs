namespace CoopMonitor.API.DTOs;

/// <summary>
/// Сводка для Dashboard (GET /api/dashboard/summary)
/// </summary>
public record DashboardSummaryDto(
    int HouseId,
    string HouseName,
    int DayOfCycle, // Текущий день цикла (относительно даты посадки, пока заглушка)
    DailyMetricsDto TodayMetrics,
    CurrentClimateDto CurrentClimate,
    List<string> ActiveAlerts
);

public record DailyMetricsDto(
    int MortalityCount,
    double MortalityRatePercent,
    double FeedConsumedKg,
    double WaterConsumedLiters,
    double? EstimatedADG // Average Daily Gain (г/сут), если есть данные взвешивания
);

public record CurrentClimateDto(
    double Temperature,
    double Humidity,
    double Co2,
    double Nh3,
    double TimeInRangePercent, // % времени в целевом диапазоне за 24ч
    DateTime LastUpdate
);

/// <summary>
/// DTO для отправки данных сенсоров (POST /api/sensors)
/// </summary>
public record SensorReadingDto(
    int HouseId,
    DateTime Timestamp,
    double Temperature,
    double Humidity,
    double Co2,
    double Nh3
);