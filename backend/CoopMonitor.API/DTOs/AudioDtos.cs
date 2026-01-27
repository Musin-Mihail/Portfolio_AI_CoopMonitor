using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record CreateAudioEventDto(
    [Required] int HouseId,
    [Required] DateTime Timestamp,
    [Required] string Classification,
    [Required] double Confidence,
    string? ClipUrl
);

public record AudioEventDto(
    int Id,
    int HouseId,
    DateTime Timestamp,
    string Classification,
    double Confidence,
    string? ClipUrl
);