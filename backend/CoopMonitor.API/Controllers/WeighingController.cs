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

        if (houseId.HasValue) query = query.Where(x => x.HouseId == houseId.Value);
        if (date.HasValue) query = query.Where(x => x.Date.Date == date.Value.Date);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new WeighingRecordDto(
            r.Id, r.HouseId, r.House?.Name, r.PersonnelId, r.Personnel?.FullName,
            r.Date, r.WeightGrams, r.IsMusicPlayed, r.VideoUrl, r.CreatedAt
        )));
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<ActionResult<WeighingRecordDto>> CreateRecord([FromForm] CreateWeighingDto dto, [FromForm] IFormFile? videoFile)
    {
        if (videoFile == null || videoFile.Length == 0)
            return BadRequest("Video evidence is mandatory.");

        string bucket = "user-uploads";
        // Формируем имя файла: user-uploads/YYYY-MM-DD/weighing_HouseID_TIMESTAMP.ext
        var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
        string fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/weighing_House{dto.HouseId}_{timestamp}{Path.GetExtension(videoFile.FileName)}";

        using (var stream = videoFile.OpenReadStream())
        {
            await _fileStorage.UploadFileAsync(bucket, fileName, stream, videoFile.ContentType);
        }

        var record = new WeighingRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            WeightGrams = dto.WeightGrams,
            IsMusicPlayed = dto.IsMusicPlayed,
            VideoUrl = $"{bucket}/{fileName}"
        };

        _context.WeighingRecords.Add(record);
        await _context.SaveChangesAsync();

        // Load references for response
        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return Ok(new WeighingRecordDto(
            record.Id, record.HouseId, record.House?.Name, record.PersonnelId, record.Personnel?.FullName,
            record.Date, record.WeightGrams, record.IsMusicPlayed, record.VideoUrl, record.CreatedAt
        ));
    }

    // НОВЫЙ МЕТОД: Обновление
    [HttpPut("{id}")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UpdateRecord(int id, [FromForm] CreateWeighingDto dto, [FromForm] IFormFile? videoFile)
    {
        var record = await _context.WeighingRecords.FindAsync(id);
        if (record == null) return NotFound();

        // Если передан новый файл, загружаем и обновляем ссылку
        if (videoFile != null && videoFile.Length > 0)
        {
            string bucket = "user-uploads";
            var timestamp = DateTime.UtcNow.ToString("yyyyMMdd_HHmmss");
            string fileName = $"{DateTime.UtcNow:yyyy-MM-dd}/weighing_House{dto.HouseId}_{timestamp}{Path.GetExtension(videoFile.FileName)}";

            using (var stream = videoFile.OpenReadStream())
            {
                await _fileStorage.UploadFileAsync(bucket, fileName, stream, videoFile.ContentType);
            }
            record.VideoUrl = $"{bucket}/{fileName}";
        }

        record.HouseId = dto.HouseId;
        record.PersonnelId = dto.PersonnelId;
        record.Date = dto.Date;
        record.WeightGrams = dto.WeightGrams;
        record.IsMusicPlayed = dto.IsMusicPlayed;

        await _context.SaveChangesAsync();
        return NoContent();
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