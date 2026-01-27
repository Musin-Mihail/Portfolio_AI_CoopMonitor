using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

// --- Mortality ---

public record MortalityRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    int Quantity,
    string? Reason,
    string? AttachmentUrl,
    DateTime CreatedAt
);

public record CreateMortalityDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] int Quantity,
    string? Reason,
    string? AttachmentUrl
);

public record UpdateMortalityDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] int Quantity,
    string? Reason,
    string? AttachmentUrl
);

// --- Feed & Water ---

public record FeedWaterRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    int? FeedId,
    string? FeedName,
    double FeedQuantityKg,
    double WaterQuantityLiters,
    DateTime CreatedAt
);

public record CreateFeedWaterDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    int? FeedId,
    double FeedQuantityKg,
    double WaterQuantityLiters
);

public record UpdateFeedWaterDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    int? FeedId,
    double FeedQuantityKg,
    double WaterQuantityLiters
);

// --- Disease ---

public record DiseaseRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    string Diagnosis,
    string? Medicine,
    string? Dosage,
    string? AttachmentUrl,
    DateTime CreatedAt
);

public record CreateDiseaseDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] string Diagnosis,
    string? Medicine,
    string? Dosage,
    string? AttachmentUrl
);

public record UpdateDiseaseDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] string Diagnosis,
    string? Medicine,
    string? Dosage,
    string? AttachmentUrl
);