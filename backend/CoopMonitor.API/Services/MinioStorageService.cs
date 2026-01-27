using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;

namespace CoopMonitor.API.Services;

public class MinioStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _endpoint;
    private readonly bool _useSsl;
    private readonly ILogger<MinioStorageService> _logger;

    public MinioStorageService(
        IConfiguration configuration,
        IHttpClientFactory httpClientFactory,
        ILogger<MinioStorageService> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;

        // Чтение конфигурации
        var minioSection = configuration.GetSection("Minio");
        _endpoint = minioSection["Endpoint"] ?? "localhost:9000";
        var accessKey = minioSection["AccessKey"];
        var secretKey = minioSection["SecretKey"];
        _useSsl = minioSection.GetValue<bool>("UseSSL", false);

        // Инициализация MinIO Client
        _minioClient = new MinioClient()
            .WithEndpoint(_endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(_useSsl)
            .Build();
    }

    public async Task UploadFileAsync(string bucketName, string objectName, Stream data, string contentType)
    {
        // Проверяем существование бакета
        var beArgs = new BucketExistsArgs().WithBucket(bucketName);
        bool found = await _minioClient.BucketExistsAsync(beArgs).ConfigureAwait(false);
        if (!found)
        {
            var mbArgs = new MakeBucketArgs().WithBucket(bucketName);
            await _minioClient.MakeBucketAsync(mbArgs).ConfigureAwait(false);
        }

        // Загрузка
        if (data.CanSeek)
        {
            data.Position = 0;
        }

        var putObjectArgs = new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithStreamData(data)
            .WithObjectSize(data.Length)
            .WithContentType(contentType);

        await _minioClient.PutObjectAsync(putObjectArgs).ConfigureAwait(false);
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(string bucketName, string objectName)
    {
        var statArgs = new StatObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName);

        var stat = await _minioClient.StatObjectAsync(statArgs).ConfigureAwait(false);

        var scheme = _useSsl ? "https" : "http";
        var presignedArgs = new PresignedGetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithExpiry(60);

        var presignedUrl = await _minioClient.PresignedGetObjectAsync(presignedArgs);

        var httpClient = _httpClientFactory.CreateClient();
        var response = await httpClient.GetAsync(presignedUrl, HttpCompletionOption.ResponseHeadersRead);

        response.EnsureSuccessStatusCode();

        var stream = await response.Content.ReadAsStreamAsync();
        var fileName = Path.GetFileName(objectName);

        return (stream, stat.ContentType, fileName);
    }

    public async Task<bool> FileExistsAsync(string bucketName, string objectName)
    {
        try
        {
            var args = new StatObjectArgs()
                .WithBucket(bucketName)
                .WithObject(objectName);
            await _minioClient.StatObjectAsync(args).ConfigureAwait(false);
            return true;
        }
        catch (MinioException)
        {
            return false;
        }
    }

    public async Task<int> CleanupOldFilesAsync(string bucketName, TimeSpan retentionPeriod)
    {
        // Проверяем существование бакета
        if (!await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName)))
        {
            _logger.LogWarning("Cleanup skipped: Bucket {Bucket} does not exist.", bucketName);
            return 0;
        }

        var cutoffDate = DateTime.UtcNow.Subtract(retentionPeriod);
        var objectsToDelete = new List<string>();

        _logger.LogInformation("Starting cleanup for bucket {Bucket}. Cutoff: {Cutoff}", bucketName, cutoffDate);

        var listArgs = new ListObjectsArgs()
            .WithBucket(bucketName)
            .WithRecursive(true);

        try
        {
            // Используем IAsyncEnumerable (ListObjectsEnumAsync) вместо Observable
            var fileList = _minioClient.ListObjectsEnumAsync(listArgs);

            await foreach (var item in fileList)
            {
                if (item.LastModifiedDateTime.HasValue && item.LastModifiedDateTime.Value.ToUniversalTime() < cutoffDate)
                {
                    objectsToDelete.Add(item.Key);
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing objects in bucket {Bucket}", bucketName);
            throw;
        }

        if (objectsToDelete.Count == 0)
        {
            return 0;
        }

        _logger.LogInformation("Found {Count} files to delete in {Bucket}.", objectsToDelete.Count, bucketName);

        var removeArgs = new RemoveObjectsArgs()
            .WithBucket(bucketName)
            .WithObjects(objectsToDelete);

        try
        {
            // Исправлено: await возвращает список ошибок, .ToList() не нужен (или уже является списком)
            var errors = await _minioClient.RemoveObjectsAsync(removeArgs);

            if (errors.Count > 0)
            {
                _logger.LogError("Failed to delete {ErrorCount} objects in {Bucket}. First error: {Msg}",
                    errors.Count, bucketName, errors.First().Message);
                return objectsToDelete.Count - errors.Count;
            }

            return objectsToDelete.Count;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error executing batch delete in {Bucket}", bucketName);
            throw;
        }
    }
}