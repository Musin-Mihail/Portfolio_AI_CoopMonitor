using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record FeedDto(
    int Id,
    string Name,
    string Type,
    string? Description
);

public record CreateFeedDto(
    [Required] string Name,
    [Required] string Type,
    string? Description
);

public record UpdateFeedDto(
    [Required] string Name,
    [Required] string Type,
    string? Description
);