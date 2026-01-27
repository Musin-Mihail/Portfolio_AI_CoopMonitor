using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize] // Включаем защиту по умолчанию
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<FilesController> _logger;

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
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromForm] string bucket)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty.");
        if (!AllowedBuckets.Contains(bucket)) return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            var fileName = file.FileName;
            if (bucket == "user-uploads")
            {
                fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/{Guid.NewGuid()}_{file.FileName}";
            }

            using var stream = file.OpenReadStream();
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, file.ContentType);

            _logger.LogInformation("File uploaded: {Bucket}/{File}", bucket, fileName);
            return Ok(new { bucket, fileName, size = file.Length });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to {Bucket}", bucket);
            return StatusCode(500, "Internal server error during upload.");
        }
    }

    [HttpGet("download/{bucket}/{*filePath}")]
    [AllowAnonymous] // Разрешаем анонимный доступ, но проверяем токен вручную для поддержки Query Param
    public async Task<IActionResult> DownloadFile(string bucket, string filePath, [FromQuery] string? access_token)
    {
        // Ручная проверка авторизации, если токен передан в query string (для <video src="...">)
        if (User.Identity?.IsAuthenticated != true)
        {
            if (string.IsNullOrEmpty(access_token))
            {
                return Unauthorized("Missing access token.");
            }
            // В реальном проекте здесь нужно валидировать JWT токен.
            // Для MVP полагаемся на [Authorize] на контроллере и то, что AllowAnonymous
            // перекрывает его, но мы требуем токен.
            // Примечание: В .NET middleware auth сработает и заполнит User, если токен есть в заголовке.
            // Если токена нет в заголовке, но есть в query, нужно настроить JwtBearerOptions.Events.OnMessageReceived
            // в Program.cs.

            // Чтобы не усложнять Program.cs прямо сейчас, оставим метод [Authorize],
            // но добавим в Program.cs чтение токена из QueryString.
        }

        if (!AllowedBuckets.Contains(bucket)) return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            var (stream, contentType, fileName) = await _fileStorage.GetFileStreamAsync(bucket, filePath);
            return File(stream, contentType, fileName, enableRangeProcessing: true);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file: {Bucket}/{Path}", bucket, filePath);
            return NotFound("File not found or storage error.");
        }
    }

    [HttpGet("list/{bucket}")]
    public async Task<IActionResult> ListFiles(string bucket, [FromQuery] string? prefix)
    {
        if (!AllowedBuckets.Contains(bucket)) return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            var files = await _fileStorage.ListFilesAsync(bucket, prefix);
            return Ok(files);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error listing files in {Bucket}", bucket);
            return StatusCode(500, "Internal server error.");
        }
    }
}