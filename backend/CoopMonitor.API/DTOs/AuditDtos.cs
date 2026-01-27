namespace CoopMonitor.API.DTOs;

public record AuditLogDto(
    long Id,
    string? UserId,
    string? UserName,
    string Action,
    string? Resource,
    string? Details,
    string? IpAddress,
    DateTime Timestamp
);