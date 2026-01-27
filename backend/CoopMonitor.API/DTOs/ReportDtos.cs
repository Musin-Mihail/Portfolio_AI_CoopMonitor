namespace CoopMonitor.API.DTOs;

public record ReportMetadataDto(
    int Id,
    int HouseId,
    string HouseName,
    string ReportType,
    DateTime ReportDate,
    DateTime GeneratedAt,
    string Status
);

public record GenerateReportRequest(
    int HouseId,
    DateTime Date,
    string ReportType = "Daily"
);