using System.Security.Claims;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController : ControllerBase
{
    private readonly IFileStorageService _fileStorage;
    private readonly IAuditService _auditService;
    private readonly ILogger<FilesController> _logger;

    private static readonly HashSet<string> AllowedBuckets = new()
    {
        "raw-video", "video-clips", "reports", "user-uploads", "ai-results"
    };

    public FilesController(
        IFileStorageService fileStorage,
        IAuditService auditService,
        ILogger<FilesController> logger)
    {
        _fileStorage = fileStorage;
        _auditService = auditService;
        _logger = logger;
    }

    [HttpPost("upload")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UploadFile(
        [FromForm] IFormFile file,
        [FromForm] string bucket,
        [FromForm] int? houseId)
    {
        if (file == null || file.Length == 0) return BadRequest("File is empty.");
        if (!AllowedBuckets.Contains(bucket)) return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            var fileName = file.FileName;
            if (bucket == "user-uploads")
            {
                var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
                var prefix = houseId.HasValue ? $"House{houseId.Value}" : "General";
                fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/{prefix}_{timestamp}_{file.FileName}";
            }

            using var stream = file.OpenReadStream();
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, file.ContentType);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.Identity?.Name;
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();
            await _auditService.LogAsync(userId, userName, "Upload", $"{bucket}/{fileName}", $"Size: {file.Length}", ip);

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
    [AllowAnonymous]
    public async Task<IActionResult> DownloadFile(string bucket, string filePath, [FromQuery] string? access_token)
    {
        if (User.Identity?.IsAuthenticated != true)
        {
            if (string.IsNullOrEmpty(access_token)) return Unauthorized("Missing access token.");
        }

        if (!AllowedBuckets.Contains(bucket)) return BadRequest($"Access to bucket '{bucket}' is denied.");

        try
        {
            var (stream, contentType, fileName) = await _fileStorage.GetFileStreamAsync(bucket, filePath);

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var userName = User.Identity?.Name ?? "Anonymous";
            var ip = HttpContext.Connection.RemoteIpAddress?.ToString();

            _ = _auditService.LogAsync(userId, userName, "Download", $"{bucket}/{filePath}", null, ip);

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