using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class WeighingController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<WeighingController> _logger;

    public WeighingController(CoopContext context, IFileStorageService fileStorage, ILogger<WeighingController> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WeighingRecordDto>>> GetRecords([FromQuery] int? houseId, [FromQuery] DateTime? date)
    {
        var query = _context.WeighingRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue)
            query = query.Where(x => x.HouseId == houseId.Value);

        if (date.HasValue)
            query = query.Where(x => x.Date.Date == date.Value.Date);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new WeighingRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.WeightGrams,
            r.IsMusicPlayed,
            r.VideoUrl,
            r.CreatedAt
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<WeighingRecordDto>> GetRecord(int id)
    {
        var r = await _context.WeighingRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return NotFound();

        return new WeighingRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.WeightGrams,
            r.IsMusicPlayed,
            r.VideoUrl,
            r.CreatedAt
        );
    }

    [HttpPost]
    [DisableRequestSizeLimit] // Видео может быть большим
    public async Task<ActionResult<WeighingRecordDto>> CreateRecord([FromForm] CreateWeighingDto dto, [FromForm] IFormFile? videoFile)
    {
        // 1. Валидация видео (Обязательно согласно протоколу)
        if (videoFile == null || videoFile.Length == 0)
        {
            return BadRequest("Video evidence is mandatory for weighing records.");
        }

        // 2. Загрузка видео в MinIO
        string bucket = "user-uploads";
        string fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/weighing_{Guid.NewGuid()}{Path.GetExtension(videoFile.FileName)}";

        try
        {
            using var stream = videoFile.OpenReadStream();
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, videoFile.ContentType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload weighing video.");
            return StatusCode(500, "Failed to upload video evidence.");
        }

        // 3. Создание записи
        var record = new WeighingRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            WeightGrams = dto.WeightGrams,
            IsMusicPlayed = dto.IsMusicPlayed,
            VideoUrl = $"{bucket}/{fileName}" // Сохраняем путь к файлу
        };

        _context.WeighingRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return CreatedAtAction(nameof(GetRecord), new { id = record.Id }, new WeighingRecordDto(
            record.Id,
            record.HouseId,
            record.House?.Name,
            record.PersonnelId,
            record.Personnel?.FullName,
            record.Date,
            record.WeightGrams,
            record.IsMusicPlayed,
            record.VideoUrl,
            record.CreatedAt
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecord(int id)
    {
        var record = await _context.WeighingRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.WeighingRecords.Remove(record);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}