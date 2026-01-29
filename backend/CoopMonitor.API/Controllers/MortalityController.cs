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
public class MortalityController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<MortalityController> _logger;

    public MortalityController(CoopContext context, ILogger<MortalityController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MortalityRecordDto>>> GetRecords(
        [FromQuery] int? houseId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.MortalityRecords
            .Include(m => m.House)
            .Include(m => m.Personnel)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue)
            query = query.Where(m => m.HouseId == houseId.Value);

        if (startDate.HasValue)
            query = query.Where(m => m.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(m => m.Date <= endDate.Value);

        var records = await query.OrderByDescending(m => m.Date).ToListAsync();

        return Ok(records.Select(m => new MortalityRecordDto(
            m.Id,
            m.HouseId,
            m.House?.Name,
            m.PersonnelId,
            m.Personnel?.FullName,
            m.Date,
            m.Quantity,
            m.Reason,
            m.BirdIdentifier,
            m.Circumstances,
            m.VetComment,
            m.AttachmentUrl,
            m.CreatedAt
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MortalityRecordDto>> GetRecord(int id)
    {
        var m = await _context.MortalityRecords
            .Include(m => m.House)
            .Include(m => m.Personnel)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return NotFound();

        return new MortalityRecordDto(
            m.Id,
            m.HouseId,
            m.House?.Name,
            m.PersonnelId,
            m.Personnel?.FullName,
            m.Date,
            m.Quantity,
            m.Reason,
            m.BirdIdentifier,
            m.Circumstances,
            m.VetComment,
            m.AttachmentUrl,
            m.CreatedAt
        );
    }

    [HttpPost]
    public async Task<ActionResult<MortalityRecordDto>> CreateRecord(CreateMortalityDto dto)
    {
        var record = new MortalityRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            Quantity = dto.Quantity,
            Reason = dto.Reason,
            BirdIdentifier = dto.BirdIdentifier,
            Circumstances = dto.Circumstances,
            VetComment = dto.VetComment,
            AttachmentUrl = dto.AttachmentUrl
        };

        _context.MortalityRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return CreatedAtAction(nameof(GetRecord), new { id = record.Id }, new MortalityRecordDto(
            record.Id,
            record.HouseId,
            record.House?.Name,
            record.PersonnelId,
            record.Personnel?.FullName,
            record.Date,
            record.Quantity,
            record.Reason,
            record.BirdIdentifier,
            record.Circumstances,
            record.VetComment,
            record.AttachmentUrl,
            record.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecord(int id, UpdateMortalityDto dto)
    {
        var record = await _context.MortalityRecords.FindAsync(id);
        if (record == null) return NotFound();

        record.HouseId = dto.HouseId;
        record.PersonnelId = dto.PersonnelId;
        record.Date = dto.Date;
        record.Quantity = dto.Quantity;
        record.Reason = dto.Reason;
        record.BirdIdentifier = dto.BirdIdentifier;
        record.Circumstances = dto.Circumstances;
        record.VetComment = dto.VetComment;
        record.AttachmentUrl = dto.AttachmentUrl;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecord(int id)
    {
        var record = await _context.MortalityRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.MortalityRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}