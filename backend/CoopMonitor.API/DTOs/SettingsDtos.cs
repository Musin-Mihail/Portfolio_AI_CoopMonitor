namespace CoopMonitor.API.DTOs;

public record SystemStatusDto(
    string AppVersion,
    string Environment,
    DateTime ServerTimeUtc,
    SaaSStatusDto SaaS,
    NotificationStatusDto Notifications
);

public record SaaSStatusDto(
    bool IsConnected,
    long DailyUsageBytes,
    long DailyLimitBytes,
    double UsagePercent,
    DateTime? LastSync
);

public record NotificationStatusDto(
    bool TelegramEnabled,
    string? AdminChatId
);