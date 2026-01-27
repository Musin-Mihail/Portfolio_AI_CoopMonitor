using CoopMonitor.API.DTOs;

namespace CoopMonitor.API.Services;

public interface ICalculationService
{
    /// <summary>
    /// Рассчитывает сводные метрики для птичника на текущий момент.
    /// </summary>
    Task<DashboardSummaryDto> GetHouseSummaryAsync(int houseId);

    /// <summary>
    /// Валидирует показания сенсоров перед сохранением.
    /// </summary>
    bool ValidateSensorData(double temp, double humidity, double co2, double nh3);
}