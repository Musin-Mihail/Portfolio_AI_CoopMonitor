using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record WeighingRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    double WeightGrams,
    bool IsMusicPlayed,
    string VideoUrl,
    string? BirdIdentifier,
    double? Temperature,
    bool UpdateMarking,
    string? Symptoms,
    string? Actions,
    string? VetPrescriptions,
    string? Notes,
    DateTime CreatedAt
);

public record CreateWeighingDto
{
    [Required] public int HouseId { get; init; }
    public int? PersonnelId { get; init; }
    [Required] public DateTime Date { get; init; }
    [Required] public double WeightGrams { get; init; }
    [Required] public bool IsMusicPlayed { get; init; }

    public string? BirdIdentifier { get; init; }
    public double? Temperature { get; init; }
    public bool UpdateMarking { get; init; }
    public string? Symptoms { get; init; }
    public string? Actions { get; init; }
    public string? VetPrescriptions { get; init; }
    public string? Notes { get; init; }
}

public record MarkingRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    int BirdAgeDays,
    string? BirdIdentifier,
    string MarkingType,
    string? Color,
    string? RingNumber,
    string? Notes,
    string? AttachmentUrl,
    DateTime CreatedAt
);

public record CreateMarkingDto
{
    [Required] public int HouseId { get; init; }
    public int? PersonnelId { get; init; }
    [Required] public DateTime Date { get; init; }
    [Required] public int BirdAgeDays { get; init; }
    public string? BirdIdentifier { get; init; }
    [Required] public string MarkingType { get; init; } = string.Empty;
    public string? Color { get; init; }
    public string? RingNumber { get; init; }
    public string? Notes { get; init; }
}