using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<FilesController> _logger;

    // Разрешенные бакеты (для безопасности, чтобы не лезли в системные)
    private static readonly HashSet<string> AllowedBuckets = new()
    {
        "raw-video", "video-clips", "reports", "user-uploads", "ai-results"
    };

    public FilesController(IFileStorageService fileStorage, ILogger<FilesController> logger)
    {
        _fileStorage = fileStorage;
        _logger = logger;
    }

    [HttpPost("upload")]
    [DisableRequestSizeLimit] // Разрешаем загрузку больших видео
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string bucket)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");

        if (!AllowedBuckets.Contains(bucket))
            return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            // Генерируем уникальное имя файла, если нужно, или используем оригинальное
            // Для user-uploads лучше добавлять timestamp или GUID
            var fileName = file.FileName;
            // Если это пользовательская загрузка, структурируем по датам
            if (bucket == "user-uploads")
            {
                fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/{Guid.NewGuid()}_{file.FileName}";
            }

            using var stream = file.OpenReadStream();
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, file.ContentType);

            _logger.LogInformation("File uploaded successfully: {Bucket}/{File}", bucket, fileName);

            return Ok(new { bucket, fileName, size = file.Length });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to {Bucket}", bucket);
            return StatusCode(500, "Internal server error during upload.");
        }
    }

    [HttpGet("download/{bucket}/{*filePath}")]
    public async Task<IActionResult> DownloadFile(string bucket, string filePath)
    {
        // filePath захватывает остаток пути, но может быть URL-encoded.
        // Декодируем, если нужно (обычно ASP.NET делает это сам, но слеши могут быть проблемой).

        if (!AllowedBuckets.Contains(bucket))
            return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            var (stream, contentType, fileName) = await _fileStorage.GetFileStreamAsync(bucket, filePath);

            // Возвращаем FileStreamResult. 
            // ASP.NET Core сам обработает Range Headers (перемотку видео), если поток поддерживает Seek 
            // (NetworkStream от HttpClient не поддерживает Seek, но браузеры справляются с потоковым воспроизведением).
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file: {Bucket}/{Path}", bucket, filePath);
            return NotFound("File not found or storage error.");
        }
    }
}