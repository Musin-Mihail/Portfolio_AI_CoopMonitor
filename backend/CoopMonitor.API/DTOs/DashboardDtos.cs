namespace CoopMonitor.API.DTOs;

public record DashboardSummaryDto(
    int HouseId,
    string HouseName,
    int DayOfCycle,
    DailyMetricsDto TodayMetrics,
    CurrentClimateDto CurrentClimate,
    AudioStatusDto AudioStatus, // New Field
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

// New DTO
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