namespace CoopMonitor.API.DTOs;

public record FileMetadataDto(
    string Name,
    string Bucket,
    long Size,
    DateTime? LastModified,
    string ContentType
);