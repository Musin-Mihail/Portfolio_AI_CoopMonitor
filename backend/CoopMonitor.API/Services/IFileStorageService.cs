using CoopMonitor.API.DTOs;

namespace CoopMonitor.API.Services;

public interface IFileStorageService
{
    Task UploadFileAsync(string bucketName, string objectName, Stream data, string contentType);
    Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(string bucketName, string objectName);
    Task<bool> FileExistsAsync(string bucketName, string objectName);
    Task<int> CleanupOldFilesAsync(string bucketName, TimeSpan retentionPeriod);
    Task<IEnumerable<FileMetadataDto>> ListFilesAsync(string bucketName, string? prefix = null);
}