namespace CoopMonitor.API.Services.Notifications;

public enum AlertSeverity
{
    Info,
    Warning,
    Critical
}

public interface INotificationRouter
{
    /// <summary>
    /// Отправляет уведомление, выбирая каналы в зависимости от важности.
    /// </summary>
    Task RouteAlertAsync(string title, string details, AlertSeverity severity);

    /// <summary>
    /// Отправляет простое сообщение во все доступные каналы (обычно Info).
    /// </summary>
    Task BroadcastMessageAsync(string message);
}

public class NotificationRouter : INotificationRouter
{
    private readonly TelegramBotService _telegramService;
    private readonly EmailService _emailService;
    private readonly ILogger<NotificationRouter> _logger;

    // Внедряем конкретные реализации сервисов
    public NotificationRouter(
        TelegramBotService telegramService,
        EmailService emailService,
        ILogger<NotificationRouter> logger)
    {
        _telegramService = telegramService;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task RouteAlertAsync(string title, string details, AlertSeverity severity)
    {
        var tasks = new List<Task>();

        // Логика маршрутизации
        // 1. Telegram получает всё (оперативный канал)
        tasks.Add(_telegramService.SendAlertAsync(title, details));

        // 2. Email получает только Критические алерты (архив/эскалация)
        if (severity == AlertSeverity.Critical)
        {
            tasks.Add(_emailService.SendAlertAsync(title, details));
        }

        // Если важность Info - можно слать, например, только в TG без префикса "Alert"
        // Но здесь используем SendAlertAsync для унификации формата

        await Task.WhenAll(tasks);
    }

    public async Task BroadcastMessageAsync(string message)
    {
        // Broadcast шлет везде
        await Task.WhenAll(
            _telegramService.SendMessageAsync(message),
            _emailService.SendMessageAsync(message)
        );
    }
}