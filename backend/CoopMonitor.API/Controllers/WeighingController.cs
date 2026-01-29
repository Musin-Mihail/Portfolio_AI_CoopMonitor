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
    public async Task<ActionResult<IEnumerable<WeighingRecordDto>>> GetRecords(
        [FromQuery] int? houseId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.WeighingRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue) query = query.Where(x => x.HouseId == houseId.Value);
        if (startDate.HasValue) query = query.Where(x => x.Date >= startDate.Value);
        if (endDate.HasValue) query = query.Where(x => x.Date <= endDate.Value);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new WeighingRecordDto(
            r.Id, r.HouseId, r.House?.Name, r.PersonnelId, r.Personnel?.FullName,
            r.Date, r.WeightGrams, r.IsMusicPlayed, r.VideoUrl,
            r.BirdIdentifier, r.Temperature, r.UpdateMarking, r.Symptoms, r.Actions, r.VetPrescriptions, r.Notes,
            r.CreatedAt
        )));
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<ActionResult<WeighingRecordDto>> CreateRecord([FromForm] CreateWeighingDto dto, [FromForm] IFormFile? videoFile)
    {
        if (videoFile == null || videoFile.Length == 0)
            return BadRequest("Video evidence is mandatory.");

        string bucket = "user-uploads";
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
            VideoUrl = $"{bucket}/{fileName}",
            BirdIdentifier = dto.BirdIdentifier,
            Temperature = dto.Temperature,
            UpdateMarking = dto.UpdateMarking,
            Symptoms = dto.Symptoms,
            Actions = dto.Actions,
            VetPrescriptions = dto.VetPrescriptions,
            Notes = dto.Notes
        };

        _context.WeighingRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return Ok(new WeighingRecordDto(
            record.Id, record.HouseId, record.House?.Name, record.PersonnelId, record.Personnel?.FullName,
            record.Date, record.WeightGrams, record.IsMusicPlayed, record.VideoUrl,
            record.BirdIdentifier, record.Temperature, record.UpdateMarking, record.Symptoms, record.Actions, record.VetPrescriptions, record.Notes,
            record.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UpdateRecord(int id, [FromForm] CreateWeighingDto dto, [FromForm] IFormFile? videoFile)
    {
        var record = await _context.WeighingRecords.FindAsync(id);
        if (record == null) return NotFound();

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
        record.BirdIdentifier = dto.BirdIdentifier;
        record.Temperature = dto.Temperature;
        record.UpdateMarking = dto.UpdateMarking;
        record.Symptoms = dto.Symptoms;
        record.Actions = dto.Actions;
        record.VetPrescriptions = dto.VetPrescriptions;
        record.Notes = dto.Notes;

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