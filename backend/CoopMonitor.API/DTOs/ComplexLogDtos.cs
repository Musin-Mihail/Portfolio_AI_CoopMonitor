using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

// --- Weighing ---

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
    DateTime CreatedAt
);

/// <summary>
/// DTO для создания записи взвешивания.
/// Используется с multipart/form-data, поэтому файл передается отдельно в контроллере,
/// но поля описываются здесь.
/// </summary>
public record CreateWeighingDto
{
    [Required] public int HouseId { get; init; }
    public int? PersonnelId { get; init; }
    [Required] public DateTime Date { get; init; }
    [Required] public double WeightGrams { get; init; }
    [Required] public bool IsMusicPlayed { get; init; }

    // VideoFile передается через IFormFile в методе контроллера
}

// --- Marking ---

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

    /// <summary>
    /// Ожидаемые значения: "PaintRing" или "TapeNumber"
    /// </summary>
    [Required] public string MarkingType { get; init; } = string.Empty;

    public string? Color { get; init; }
    public string? RingNumber { get; init; }

    // PhotoFile передается через IFormFile
}