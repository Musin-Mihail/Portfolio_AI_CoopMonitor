using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record CameraDto(
    int Id,
    string Name,
    string Type,
    int? HouseId,
    string? HouseName,
    string IpAddress,
    int Port,
    string? StreamPath,
    string? Username,
    int Position,
    bool IsActive,
    string ConstructedRtspUrl
);

public record CreateCameraDto
{
    [Required]
    public string Name { get; init; } = string.Empty;

    [Required]
    public string Type { get; init; } = "RGB";

    public int? HouseId { get; init; }

    [Required]
    public string IpAddress { get; init; } = string.Empty;

    public int Port { get; init; } = 554;
    public string? Username { get; init; }
    public string? Password { get; init; }
    public string? StreamPath { get; init; }
    public string? RtspUrlOverride { get; init; }
    public int Position { get; init; }
}

public record UpdateCameraDto : CreateCameraDto
{
    public bool IsActive { get; init; }
}