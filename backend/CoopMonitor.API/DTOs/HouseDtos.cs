using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record HouseDto(
    int Id,
    string Name,
    double Area,
    int Capacity,
    string? ConfigurationJson,
    DateTime CreatedAt
);

public record CreateHouseDto(
    [Required] string Name,
    [Required] double Area,
    [Required] int Capacity,
    string? ConfigurationJson
);

public record UpdateHouseDto(
    [Required] string Name,
    [Required] double Area,
    [Required] int Capacity,
    string? ConfigurationJson
);