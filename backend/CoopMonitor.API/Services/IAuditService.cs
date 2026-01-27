namespace CoopMonitor.API.Services;

public interface IAuditService
{
    /// <summary>
    /// Фиксирует действие пользователя в журнале аудита.
    /// </summary>
    /// <param name="userId">ID пользователя (если есть).</param>
    /// <param name="userName">Имя пользователя (или "Anonymous").</param>
    /// <param name="action">Тип действия (Login, Upload, etc.).</param>
    /// <param name="resource">Объект воздействия (файл, сущность).</param>
    /// <param name="details">Дополнительные детали.</param>
    /// <param name="ipAddress">IP адрес клиента.</param>
    Task LogAsync(string? userId, string? userName, string action, string? resource, string? details = null, string? ipAddress = null);
}