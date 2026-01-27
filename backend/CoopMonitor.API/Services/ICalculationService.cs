using CoopMonitor.API.DTOs;

namespace CoopMonitor.API.Services;

public interface ICalculationService
{
    /// <summary>
    /// Рассчитывает сводные метрики для птичника на текущий момент.
    /// </summary>
    Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId);

    /// <summary>
    /// Возвращает исторические данные климата за указанный период (по умолчанию 24 часа).
    /// </summary>
    Task<List<ClimateHistoryPoint>> GetHouseHistoryAsync(int houseId, int hours = 24);

    /// <summary>
    /// Рассчитывает производственные метрики за указанный период (неделя, месяц).
    /// </summary>
    Task<ProductionMetricsDto> CalculateProductionMetricsAsync(int houseId, DateTime startDate, DateTime endDate);

    /// <summary>
    /// Валидирует показания сенсоров перед сохранением.
    /// </summary>
    bool ValidateSensorData(double temp, double humidity, double co2, double nh3);
}