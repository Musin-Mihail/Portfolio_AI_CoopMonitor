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
    string Status, // "Healthy", "Warning", "Unknown"
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

// --- New History DTOs ---

public record ClimateHistoryPoint(
    DateTime Timestamp,
    double Temperature,
    double Humidity,
    double Co2,
    double Nh3
);

// --- Production Metrics DTO ---

public record ProductionMetricsDto(
    double FeedConsumedKg,
    double WaterConsumedLiters,
    int MortalityCount,
    double MortalityRatePercent,
    double StartWeightGrams,
    double EndWeightGrams,
    double FCR, // Feed Conversion Ratio
    double StockingDensityKgM2 // Плотность посадки
);