using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record MortalityRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    int Quantity,
    string? Reason,
    string? BirdIdentifier,
    string? Circumstances,
    string? VetComment,
    string? AttachmentUrl,
    DateTime CreatedAt
);

public record CreateMortalityDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] int Quantity,
    string? Reason,
    string? BirdIdentifier,
    string? Circumstances,
    string? VetComment,
    string? AttachmentUrl
);

public record UpdateMortalityDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] int Quantity,
    string? Reason,
    string? BirdIdentifier,
    string? Circumstances,
    string? VetComment,
    string? AttachmentUrl
);

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
    string? BirdIdentifier,
    string? Medicine,
    string? Comments,
    DateTime CreatedAt
);

public record CreateFeedWaterDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    int? FeedId,
    double FeedQuantityKg,
    double WaterQuantityLiters,
    string? BirdIdentifier,
    string? Medicine,
    string? Comments
);

public record UpdateFeedWaterDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    int? FeedId,
    double FeedQuantityKg,
    double WaterQuantityLiters,
    string? BirdIdentifier,
    string? Medicine,
    string? Comments
);

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

public record BatchInfoRecordDto(
    int Id,
    int HouseId,
    string? HouseName,
    int? PersonnelId,
    string? PersonnelName,
    DateTime Date,
    int Quantity,
    int BirdAgeDays,
    DateTime CreatedAt
);

public record CreateBatchInfoDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] int Quantity,
    [Required] int BirdAgeDays
);

public record UpdateBatchInfoDto(
    [Required] int HouseId,
    int? PersonnelId,
    [Required] DateTime Date,
    [Required] int Quantity,
    [Required] int BirdAgeDays
);