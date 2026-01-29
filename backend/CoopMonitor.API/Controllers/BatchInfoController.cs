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
public class BatchInfoController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<BatchInfoController> _logger;

    public BatchInfoController(CoopContext context, ILogger<BatchInfoController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BatchInfoRecordDto>>> GetRecords([FromQuery] int? houseId, [FromQuery] DateTime? date)
    {
        var query = _context.BatchInfoRecords
            .Include(m => m.House)
            .Include(m => m.Personnel)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue)
            query = query.Where(m => m.HouseId == houseId.Value);

        if (date.HasValue)
            query = query.Where(m => m.Date.Date == date.Value.Date);

        var records = await query.OrderByDescending(m => m.Date).ToListAsync();

        return Ok(records.Select(m => new BatchInfoRecordDto(
            m.Id,
            m.HouseId,
            m.House?.Name,
            m.PersonnelId,
            m.Personnel?.FullName,
            m.Date,
            m.Quantity,
            m.BirdAgeDays,
            m.CreatedAt
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<BatchInfoRecordDto>> GetRecord(int id)
    {
        var m = await _context.BatchInfoRecords
            .Include(m => m.House)
            .Include(m => m.Personnel)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (m == null) return NotFound();

        return new BatchInfoRecordDto(
            m.Id,
            m.HouseId,
            m.House?.Name,
            m.PersonnelId,
            m.Personnel?.FullName,
            m.Date,
            m.Quantity,
            m.BirdAgeDays,
            m.CreatedAt
        );
    }

    [HttpPost]
    public async Task<ActionResult<BatchInfoRecordDto>> CreateRecord(CreateBatchInfoDto dto)
    {
        var record = new BatchInfoRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            Quantity = dto.Quantity,
            BirdAgeDays = dto.BirdAgeDays
        };

        _context.BatchInfoRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();

        return CreatedAtAction(nameof(GetRecord), new { id = record.Id }, new BatchInfoRecordDto(
            record.Id,
            record.HouseId,
            record.House?.Name,
            record.PersonnelId,
            record.Personnel?.FullName,
            record.Date,
            record.Quantity,
            record.BirdAgeDays,
            record.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecord(int id, UpdateBatchInfoDto dto)
    {
        var record = await _context.BatchInfoRecords.FindAsync(id);
        if (record == null) return NotFound();

        record.HouseId = dto.HouseId;
        record.PersonnelId = dto.PersonnelId;
        record.Date = dto.Date;
        record.Quantity = dto.Quantity;
        record.BirdAgeDays = dto.BirdAgeDays;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecord(int id)
    {
        var record = await _context.BatchInfoRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.BatchInfoRecords.Remove(record);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}