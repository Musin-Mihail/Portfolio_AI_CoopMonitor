namespace CoopMonitor.API.DTOs;

public record DashboardSummaryDto(
    int HouseId,
    string HouseName,
    int DayOfCycle,
    DailyMetricsDto TodayMetrics,
    CurrentClimateDto CurrentClimate,
    AudioStatusDto AudioStatus,
    List<string> ActiveAlerts
);

public record DailyMetricsDto(
    int MortalityCount,
    double MortalityRatePercent,
    double FeedConsumedKg,
    double WaterConsumedLiters,
    double? EstimatedADG
);

public record CurrentClimateDto(
    double Temperature,
    double Humidity,
    double Co2,
    double Nh3,
    double TimeInRangePercent,
    DateTime LastUpdate
);

public record AudioStatusDto(
    string Status,
    string LastClassification,
    DateTime LastUpdate
);

public record SensorReadingDto(
    int HouseId,
    DateTime Timestamp,
    double Temperature,
    double Humidity,
    double Co2,
    double Nh3
);

public record ClimateHistoryPoint(
    DateTime Timestamp,
    double Temperature,
    double Humidity,
    double Co2,
    double Nh3
);

public record ComparisonHistoryDto(
    int HouseId,
    string HouseName,
    List<HistoryPointDto> Data
);

public record HistoryPointDto(
    DateTime Timestamp,
    double Value
);

public record ProductionMetricsDto(
    double FeedConsumedKg,
    double WaterConsumedLiters,
    int MortalityCount,
    double MortalityRatePercent,
    double StartWeightGrams,
    double EndWeightGrams,
    double FCR,
    double StockingDensityKgM2
);