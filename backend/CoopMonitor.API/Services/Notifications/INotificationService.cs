namespace CoopMonitor.API.Services.Notifications;

public interface INotificationService
{
    /// <summary>
    /// Отправляет текстовое уведомление в настроенный канал.
    /// </summary>
    Task SendMessageAsync(string message);

    /// <summary>
    /// Отправляет уведомление о критическом алерте.
    /// </summary>
    Task SendAlertAsync(string title, string details);
}