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
public class MarkingController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ILogger<MarkingController> _logger;

    public MarkingController(CoopContext context, IFileStorageService fileStorage, ILogger<MarkingController> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MarkingRecordDto>>> GetRecords([FromQuery] int? houseId, [FromQuery] DateTime? date)
    {
        var query = _context.MarkingRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue)
            query = query.Where(x => x.HouseId == houseId.Value);

        if (date.HasValue)
            query = query.Where(x => x.Date.Date == date.Value.Date);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new MarkingRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.BirdAgeDays,
            r.BirdIdentifier,
            r.MarkingType,
            r.Color,
            r.RingNumber,
            r.AttachmentUrl,
            r.CreatedAt
        )));
    }

    [HttpPost]
    public async Task<ActionResult<MarkingRecordDto>> CreateRecord([FromForm] CreateMarkingDto dto, [FromForm] IFormFile? photoFile)
    {
        // 1. Валидация протокола маркировки
        if (dto.BirdAgeDays < 14)
        {
            if (dto.MarkingType != "PaintRing")
            {
                return BadRequest($"Invalid marking type for age {dto.BirdAgeDays}. Expected 'PaintRing'.");
            }
        }
        else // 14+ days
        {
            if (dto.MarkingType != "TapeNumber")
            {
                return BadRequest($"Invalid marking type for age {dto.BirdAgeDays}. Expected 'TapeNumber'.");
            }
        }

        // 2. Загрузка фото (если есть)
        string? attachmentUrl = null;
        if (photoFile != null && photoFile.Length > 0)
        {
            string bucket = "user-uploads";
            string fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/marking_{Guid.NewGuid()}{Path.GetExtension(photoFile.FileName)}";
            try
            {
                using var stream = photoFile.OpenReadStream();
                await _fileStorage.UploadFileAsync(bucket, fileName, stream, photoFile.ContentType);
                attachmentUrl = $"{bucket}/{fileName}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to upload marking photo.");
                // Фото не обязательно по жесткому требованию кода, но желательно. Логируем и продолжаем.
            }
        }

        // 3. Создание записи
        var record = new MarkingRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            BirdAgeDays = dto.BirdAgeDays,
            BirdIdentifier = dto.BirdIdentifier,
            MarkingType = dto.MarkingType,
            Color = dto.Color,
            RingNumber = dto.RingNumber,
            AttachmentUrl = attachmentUrl
        };

        _context.MarkingRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return CreatedAtAction(nameof(GetRecords), new { id = record.Id }, new MarkingRecordDto(
            record.Id,
            record.HouseId,
            record.House?.Name,
            record.PersonnelId,
            record.Personnel?.FullName,
            record.Date,
            record.BirdAgeDays,
            record.BirdIdentifier,
            record.MarkingType,
            record.Color,
            record.RingNumber,
            record.AttachmentUrl,
            record.CreatedAt
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecord(int id)
    {
        var record = await _context.MarkingRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.MarkingRecords.Remove(record);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}