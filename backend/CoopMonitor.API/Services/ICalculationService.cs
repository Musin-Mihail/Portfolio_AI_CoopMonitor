using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;

namespace CoopMonitor.API.Services;

public interface ICalculationService
{
    Task<IEnumerable<DashboardSummaryDto>> GetAllHousesSummaryAsync();
    Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId);

    Task<IEnumerable<ClimateHistoryPoint>> GetHouseHistoryAsync(int houseId, int hours, int aggregationMinutes);

    Task<IEnumerable<ComparisonHistoryDto>> GetComparisonHistoryAsync(string sensorType, int hours, int aggregationMinutes);

    Task<ProductionMetricsDto> CalculateProductionMetricsAsync(int houseId, DateTime start, DateTime end);
    bool ValidateSensorData(double temp, double hum, double co2, double nh3);
}