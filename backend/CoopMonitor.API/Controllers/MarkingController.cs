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

        if (houseId.HasValue) query = query.Where(x => x.HouseId == houseId.Value);
        if (date.HasValue) query = query.Where(x => x.Date.Date == date.Value.Date);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new MarkingRecordDto(
            r.Id, r.HouseId, r.House?.Name, r.PersonnelId, r.Personnel?.FullName,
            r.Date, r.BirdAgeDays, r.BirdIdentifier, r.MarkingType, r.Color, r.RingNumber, r.AttachmentUrl, r.CreatedAt
        )));
    }

    [HttpPost]
    public async Task<ActionResult<MarkingRecordDto>> CreateRecord([FromForm] CreateMarkingDto dto, [FromForm] IFormFile? photoFile)
    {
        // Валидация протокола
        if ((dto.BirdAgeDays < 14 && dto.MarkingType != "PaintRing") || (dto.BirdAgeDays >= 14 && dto.MarkingType != "TapeNumber"))
            return BadRequest($"Invalid marking type '{dto.MarkingType}' for age {dto.BirdAgeDays}.");

        string? attachmentUrl = null;
        if (photoFile != null && photoFile.Length > 0)
        {
            string bucket = "user-uploads";
            string fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/marking_{Guid.NewGuid()}{Path.GetExtension(photoFile.FileName)}";
            using var stream = photoFile.OpenReadStream();
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, photoFile.ContentType);
            attachmentUrl = $"{bucket}/{fileName}";
        }

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

        return Ok(new MarkingRecordDto(
            record.Id, record.HouseId, record.House?.Name, record.PersonnelId, record.Personnel?.FullName,
            record.Date, record.BirdAgeDays, record.BirdIdentifier, record.MarkingType, record.Color, record.RingNumber, record.AttachmentUrl, record.CreatedAt
        ));
    }

    // НОВЫЙ МЕТОД: Обновление
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecord(int id, [FromForm] CreateMarkingDto dto, [FromForm] IFormFile? photoFile)
    {
        var record = await _context.MarkingRecords.FindAsync(id);
        if (record == null) return NotFound();

        // Протокол
        if ((dto.BirdAgeDays < 14 && dto.MarkingType != "PaintRing") || (dto.BirdAgeDays >= 14 && dto.MarkingType != "TapeNumber"))
            return BadRequest($"Invalid marking type '{dto.MarkingType}' for age {dto.BirdAgeDays}.");

        if (photoFile != null && photoFile.Length > 0)
        {
            string bucket = "user-uploads";
            string fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/marking_{Guid.NewGuid()}{Path.GetExtension(photoFile.FileName)}";
            using var stream = photoFile.OpenReadStream();
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, photoFile.ContentType);
            record.AttachmentUrl = $"{bucket}/{fileName}";
        }

        record.HouseId = dto.HouseId;
        record.PersonnelId = dto.PersonnelId;
        record.Date = dto.Date;
        record.BirdAgeDays = dto.BirdAgeDays;
        record.BirdIdentifier = dto.BirdIdentifier;
        record.MarkingType = dto.MarkingType;
        record.Color = dto.Color;
        record.RingNumber = dto.RingNumber;

        await _context.SaveChangesAsync();
        return NoContent();
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