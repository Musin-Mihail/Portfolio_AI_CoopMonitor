using CoopMonitor.API.DTOs;

namespace CoopMonitor.API.Services;

public interface ICalculationService
{
    // Новый метод для получения списка всех
    Task<IEnumerable<DashboardSummaryDto>> GetAllHousesSummaryAsync();

    Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId);
    Task<IEnumerable<ClimateHistoryPoint>> GetHouseHistoryAsync(int houseId, int hours, int aggregationMinutes = 0);
    Task<ProductionMetricsDto> CalculateProductionMetricsAsync(int houseId, DateTime start, DateTime end);
    bool ValidateSensorData(double temp, double hum, double co2, double nh3);
}