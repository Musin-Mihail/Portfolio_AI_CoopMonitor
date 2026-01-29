using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DiseaseController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<DiseaseController> _logger;

    public DiseaseController(CoopContext context, ILogger<DiseaseController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DiseaseRecordDto>>> GetRecords(
        [FromQuery] int? houseId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.DiseaseRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue)
            query = query.Where(x => x.HouseId == houseId.Value);

        if (startDate.HasValue)
            query = query.Where(x => x.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(x => x.Date <= endDate.Value);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new DiseaseRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.Diagnosis,
            r.Medicine,
            r.Dosage,
            r.AttachmentUrl,
            r.CreatedAt
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DiseaseRecordDto>> GetRecord(int id)
    {
        var r = await _context.DiseaseRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return NotFound();

        return new DiseaseRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.Diagnosis,
            r.Medicine,
            r.Dosage,
            r.AttachmentUrl,
            r.CreatedAt
        );
    }

    [HttpPost]
    public async Task<ActionResult<DiseaseRecordDto>> CreateRecord(CreateDiseaseDto dto)
    {
        var record = new DiseaseRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            Diagnosis = dto.Diagnosis,
            Medicine = dto.Medicine,
            Dosage = dto.Dosage,
            AttachmentUrl = dto.AttachmentUrl
        };

        _context.DiseaseRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return CreatedAtAction(nameof(GetRecord), new { id = record.Id }, new DiseaseRecordDto(
            record.Id,
            record.HouseId,
            record.House?.Name,
            record.PersonnelId,
            record.Personnel?.FullName,
            record.Date,
            record.Diagnosis,
            record.Medicine,
            record.Dosage,
            record.AttachmentUrl,
            record.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecord(int id, UpdateDiseaseDto dto)
    {
        var record = await _context.DiseaseRecords.FindAsync(id);
        if (record == null) return NotFound();

        record.HouseId = dto.HouseId;
        record.PersonnelId = dto.PersonnelId;
        record.Date = dto.Date;
        record.Diagnosis = dto.Diagnosis;
        record.Medicine = dto.Medicine;
        record.Dosage = dto.Dosage;
        record.AttachmentUrl = dto.AttachmentUrl;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecord(int id)
    {
        var record = await _context.DiseaseRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.DiseaseRecords.Remove(record);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}