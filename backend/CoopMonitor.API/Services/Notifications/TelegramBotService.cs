using Telegram.Bot;
using Telegram.Bot.Polling;
using Telegram.Bot.Types;
using Telegram.Bot.Types.Enums;
using CoopMonitor.API.Data;
using CoopMonitor.API.Services.Alerting;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Services.Notifications;

/// <summary>
/// Сервис для работы с Telegram: реализует отправку уведомлений и обработку входящих команд.
/// Работает как BackgroundService для поллинга обновлений.
/// </summary>
public class TelegramBotService : BackgroundService, INotificationService
{
    private readonly ILogger<TelegramBotService> _logger;
    private readonly IServiceProvider _serviceProvider;
    private readonly TelegramBotClient? _botClient;
    private readonly string _adminChatId;
    private readonly bool _isEnabled;

    // Исправлено: IConfiguration внедряется напрямую, без IOptions
    public TelegramBotService(
        IConfiguration config,
        IServiceProvider serviceProvider,
        ILogger<TelegramBotService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;

        var tgConfig = config.GetSection("Telegram");
        var token = tgConfig["BotToken"];
        _adminChatId = tgConfig["AdminChatId"] ?? "";
        _isEnabled = tgConfig.GetValue<bool>("Enabled");

        if (_isEnabled && !string.IsNullOrEmpty(token))
        {
            _botClient = new TelegramBotClient(token);
        }
        else
        {
            _logger.LogWarning("Telegram Bot is disabled or token is missing.");
        }
    }

    // --- INotificationService Implementation ---

    public async Task SendMessageAsync(string message)
    {
        if (_botClient == null || string.IsNullOrEmpty(_adminChatId)) return;

        try
        {
            await _botClient.SendMessage(new ChatId(_adminChatId), message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram message.");
        }
    }

    public async Task SendAlertAsync(string title, string details)
    {
        if (_botClient == null || string.IsNullOrEmpty(_adminChatId)) return;

        string text = $"🚨 *{title}*\n\n{details}";
        try
        {
            await _botClient.SendMessage(new ChatId(_adminChatId), text, parseMode: ParseMode.Markdown);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send Telegram alert.");
        }
    }

    // --- Background Service Logic (Polling) ---

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        if (_botClient == null) return;

        var receiverOptions = new ReceiverOptions
        {
            AllowedUpdates = [UpdateType.Message]
        };

        _logger.LogInformation("Starting Telegram Bot Polling...");

        try
        {
            await _botClient.ReceiveAsync(
                updateHandler: HandleUpdateAsync,
                errorHandler: HandleErrorAsync,
                receiverOptions: receiverOptions,
                cancellationToken: stoppingToken
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Telegram Bot polling stopped due to error.");
        }
    }

    private async Task HandleUpdateAsync(ITelegramBotClient bot, Update update, CancellationToken ct)
    {
        if (update.Message is not { } message) return;
        if (message.Text is not { } messageText) return;

        var chatId = message.Chat.Id;
        _logger.LogInformation("Received message '{Text}' from {ChatId}", messageText, chatId);

        // Команды
        string response = "";
        switch (messageText.Split(' ')[0].ToLower())
        {
            case "/start":
                response = "👋 Welcome to CoopMonitor Bot!\nUse /status to see farm summary.\nUse /alerts to see active issues.";
                break;

            case "/status":
                response = await GetFarmStatusAsync();
                break;

            case "/alerts":
                response = await GetActiveAlertsAsync();
                break;

            case "/id":
                response = $"Your Chat ID: `{chatId}`";
                break;

            default:
                response = "Unknown command. Try /status or /alerts.";
                break;
        }

        if (!string.IsNullOrEmpty(response))
        {
            await bot.SendMessage(chatId, response, parseMode: ParseMode.Markdown, cancellationToken: ct);
        }
    }

    private Task HandleErrorAsync(ITelegramBotClient bot, Exception exception, CancellationToken ct)
    {
        _logger.LogError(exception, "Telegram Bot Error");
        return Task.CompletedTask;
    }

    // --- Logic for Commands ---

    private async Task<string> GetFarmStatusAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<CoopContext>();

        var houses = await context.Houses.AsNoTracking().ToListAsync();
        if (!houses.Any()) return "No houses configured.";

        var report = "🏭 *Farm Status*\n";

        foreach (var house in houses)
        {
            var lastReading = await context.SensorReadings
                .Where(r => r.HouseId == house.Id)
                .OrderByDescending(r => r.Date)
                .FirstOrDefaultAsync();

            report += $"\n🏠 *{house.Name}*";
            if (lastReading != null)
            {
                report += $"\n🌡 Temp: {lastReading.Temperature:F1}°C";
                report += $"\n💧 Hum: {lastReading.Humidity:F0}%";
                report += $"\n💨 NH3: {lastReading.Nh3:F1} ppm";
                report += $"\n🕒 {lastReading.Date:HH:mm}";
            }
            else
            {
                report += "\n_No data available_";
            }
            report += "\n";
        }

        return report;
    }

    private async Task<string> GetActiveAlertsAsync()
    {
        using var scope = _serviceProvider.CreateScope();
        var alertService = scope.ServiceProvider.GetRequiredService<IAlertService>();
        // Для простоты берем алерты для всех птичников
        var context = scope.ServiceProvider.GetRequiredService<CoopContext>();
        var houses = await context.Houses.Select(h => h.Id).ToListAsync();

        var allAlerts = new List<string>();

        foreach (var houseId in houses)
        {
            var alerts = await alertService.GetActiveAlertsAsync(houseId);
            if (alerts.Any())
            {
                allAlerts.Add($"*House #{houseId}:*");
                allAlerts.AddRange(alerts.Select(a => $"- {a}"));
            }
        }

        if (!allAlerts.Any()) return "✅ No active alerts.";
        return "⚠️ *Active Alerts*\n\n" + string.Join("\n", allAlerts);
    }
}