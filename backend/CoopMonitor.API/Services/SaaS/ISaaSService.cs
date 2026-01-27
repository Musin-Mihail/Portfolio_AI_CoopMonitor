namespace CoopMonitor.API.Services.SaaS;

public interface ISaaSService
{
    /// <summary>
    /// Проверяет, можно ли отправить указанный объем данных (в байтах) сегодня.
    /// </summary>
    Task<bool> CanUploadAsync(long bytes);

    /// <summary>
    /// Фиксирует использование трафика.
    /// </summary>
    Task RecordUsageAsync(long bytes);

    /// <summary>
    /// Имитирует отправку файла отчета в облако.
    /// </summary>
    Task<bool> UploadReportAsync(string fileName, Stream content);

    /// <summary>
    /// Имитирует получение обновлений конфигурации.
    /// </summary>
    Task CheckForUpdatesAsync();
}