namespace CoopMonitor.API.Services.Notifications;

public enum AlertSeverity
{
    Info,
    Warning,
    Critical
}

public interface INotificationRouter
{
    Task RouteAlertAsync(string title, string details, AlertSeverity severity);
    Task BroadcastMessageAsync(string message);
}

public class NotificationRouter : INotificationRouter
{
    private readonly TelegramBotService _telegramService;
    private readonly EmailService _emailService;
    private readonly ILogger<NotificationRouter> _logger;

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

        tasks.Add(_telegramService.SendAlertAsync(title, details));

        if (severity == AlertSeverity.Critical)
        {
            tasks.Add(_emailService.SendAlertAsync(title, details));
        }

        await Task.WhenAll(tasks);
    }

    public async Task BroadcastMessageAsync(string message)
    {
        await Task.WhenAll(
            _telegramService.SendMessageAsync(message),
            _emailService.SendMessageAsync(message)
        );
    }
}