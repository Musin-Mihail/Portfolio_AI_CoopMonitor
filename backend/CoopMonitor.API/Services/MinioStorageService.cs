using Minio;
using Minio.DataModel.Args;
using Minio.Exceptions;
using Microsoft.Extensions.Options;

namespace CoopMonitor.API.Services;

public class MinioStorageService : IFileStorageService
{
    private readonly IMinioClient _minioClient;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly string _endpoint;
    private readonly bool _useSsl;

    public MinioStorageService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClientFactory = httpClientFactory;

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
        // Проверяем существование бакета (опционально, т.к. они создаются скриптом, но для надежности оставим)
        var beArgs = new BucketExistsArgs().WithBucket(bucketName);
        bool found = await _minioClient.BucketExistsAsync(beArgs).ConfigureAwait(false);
        if (!found)
        {
            var mbArgs = new MakeBucketArgs().WithBucket(bucketName);
            await _minioClient.MakeBucketAsync(mbArgs).ConfigureAwait(false);
        }

        // Загрузка
        // Сбрасываем позицию потока, если это возможно, чтобы читать с начала
        if (data.CanSeek)
        {
            data.Position = 0;
        }

        var putObjectArgs = new PutObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithStreamData(data)
            .WithObjectSize(data.Length) // Важно для корректной работы MinIO
            .WithContentType(contentType);

        await _minioClient.PutObjectAsync(putObjectArgs).ConfigureAwait(false);
    }

    public async Task<(Stream FileStream, string ContentType, string FileName)> GetFileStreamAsync(string bucketName, string objectName)
    {
        // 1. Получаем метаданные через SDK, чтобы убедиться, что файл есть и получить Content-Type
        var statArgs = new StatObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName);

        var stat = await _minioClient.StatObjectAsync(statArgs).ConfigureAwait(false);

        // 2. Для получения потока используем HttpClient напрямую к MinIO.
        // Это позволяет вернуть чистый NetworkStream для передачи в контроллер (Secure Proxy),
        // избегая callback-ад в MinIO SDK и буферизации в MemoryStream (критично для видео).

        var scheme = _useSsl ? "https" : "http";
        // Генерируем временную подписанную ссылку (с коротким сроком жизни), 
        // чтобы HttpClient мог авторизованно скачать файл.
        var presignedArgs = new PresignedGetObjectArgs()
            .WithBucket(bucketName)
            .WithObject(objectName)
            .WithExpiry(60); // 60 секунд на начало скачивания

        var presignedUrl = await _minioClient.PresignedGetObjectAsync(presignedArgs);

        var httpClient = _httpClientFactory.CreateClient();

        // Используем HttpCompletionOption.ResponseHeadersRead, чтобы не грузить весь файл в память
        var response = await httpClient.GetAsync(presignedUrl, HttpCompletionOption.ResponseHeadersRead);

        response.EnsureSuccessStatusCode();

        var stream = await response.Content.ReadAsStreamAsync();

        // Извлекаем имя файла из пути
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
        catch (MinioException) // ObjectNotFound usually throws exception
        {
            return false;
        }
    }
}