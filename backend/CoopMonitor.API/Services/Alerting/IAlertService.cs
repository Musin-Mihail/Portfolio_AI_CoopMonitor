using CoopMonitor.API.Models;

namespace CoopMonitor.API.Services.Alerting;

public interface IAlertService
{
    /// <summary>
    /// Проверяет показатели и возвращает список текстовых алертов.
    /// Используется для Дашборда и Бота.
    /// </summary>
    Task<List<string>> GetActiveAlertsAsync(int houseId);

    /// <summary>
    /// Проверяет входящие данные сенсоров на критические отклонения и отправляет уведомления немедленно.
    /// </summary>
    Task CheckSensorIngestionAsync(int houseId, SensorReading reading);

    /// <summary>
    /// Проверяет аудио события на наличие патологий (кашель, паника) и отправляет уведомления.
    /// </summary>
    Task CheckAudioIngestionAsync(int houseId, AudioEvent audioEvent);
}