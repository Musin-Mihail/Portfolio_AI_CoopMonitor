using CoopMonitor.API.DTOs;
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

        var minioSection = configuration.GetSection("Minio");
        _endpoint = minioSection["Endpoint"] ?? "localhost:9000";
        var accessKey = minioSection["AccessKey"];
        var secretKey = minioSection["SecretKey"];
        _useSsl = minioSection.GetValue<bool>("UseSSL", false);

        _minioClient = new MinioClient()
            .WithEndpoint(_endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithSSL(_useSsl)
            .Build();
    }

    public async Task UploadFileAsync(string bucketName, string objectName, Stream data, string contentType)
    {
        var beArgs = new BucketExistsArgs().WithBucket(bucketName);
        bool found = await _minioClient.BucketExistsAsync(beArgs).ConfigureAwait(false);
        if (!found)
        {
            var mbArgs = new MakeBucketArgs().WithBucket(bucketName);
            await _minioClient.MakeBucketAsync(mbArgs).ConfigureAwait(false);
        }

        if (data.CanSeek) data.Position = 0;

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
        var statArgs = new StatObjectArgs().WithBucket(bucketName).WithObject(objectName);
        var stat = await _minioClient.StatObjectAsync(statArgs).ConfigureAwait(false);

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
            await _minioClient.StatObjectAsync(new StatObjectArgs().WithBucket(bucketName).WithObject(objectName));
            return true;
        }
        catch (MinioException) { return false; }
    }

    public async Task<int> CleanupOldFilesAsync(string bucketName, TimeSpan retentionPeriod)
    {
        if (!await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName))) return 0;

        var cutoffDate = DateTime.UtcNow.Subtract(retentionPeriod);
        var objectsToDelete = new List<string>();

        var listArgs = new ListObjectsArgs().WithBucket(bucketName).WithRecursive(true);
        var fileList = _minioClient.ListObjectsEnumAsync(listArgs);

        await foreach (var item in fileList)
        {
            if (item.LastModifiedDateTime.HasValue && item.LastModifiedDateTime.Value.ToUniversalTime() < cutoffDate)
            {
                objectsToDelete.Add(item.Key);
            }
        }

        if (objectsToDelete.Count == 0) return 0;

        var removeArgs = new RemoveObjectsArgs().WithBucket(bucketName).WithObjects(objectsToDelete);
        var errors = await _minioClient.RemoveObjectsAsync(removeArgs);

        return objectsToDelete.Count - errors.Count;
    }

    public async Task<IEnumerable<FileMetadataDto>> ListFilesAsync(string bucketName, string? prefix = null)
    {
        var result = new List<FileMetadataDto>();

        if (!await _minioClient.BucketExistsAsync(new BucketExistsArgs().WithBucket(bucketName)))
        {
            return result;
        }

        var listArgs = new ListObjectsArgs()
            .WithBucket(bucketName)
            .WithRecursive(true);

        if (!string.IsNullOrEmpty(prefix))
        {
            listArgs = listArgs.WithPrefix(prefix);
        }

        var fileList = _minioClient.ListObjectsEnumAsync(listArgs);

        await foreach (var item in fileList)
        {
            if (!item.IsDir)
            {
                string contentType = "application/octet-stream";
                var ext = Path.GetExtension(item.Key).ToLower();
                if (ext == ".mp4") contentType = "video/mp4";
                else if (ext == ".jpg" || ext == ".jpeg") contentType = "image/jpeg";
                else if (ext == ".png") contentType = "image/png";
                else if (ext == ".html") contentType = "text/html";
                else if (ext == ".json") contentType = "application/json";

                result.Add(new FileMetadataDto(
                    item.Key,
                    bucketName,
                    (long)item.Size,
                    item.LastModifiedDateTime?.ToUniversalTime(),
                    contentType
                ));
            }
        }

        return result.OrderByDescending(f => f.LastModified);
    }
}