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
public class FeedWaterController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<FeedWaterController> _logger;

    public FeedWaterController(CoopContext context, ILogger<FeedWaterController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeedWaterRecordDto>>> GetRecords(
        [FromQuery] int? houseId,
        [FromQuery] DateTime? startDate,
        [FromQuery] DateTime? endDate)
    {
        var query = _context.FeedWaterRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .Include(x => x.Feed)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue)
            query = query.Where(x => x.HouseId == houseId.Value);

        if (startDate.HasValue)
            query = query.Where(x => x.Date >= startDate.Value);

        if (endDate.HasValue)
            query = query.Where(x => x.Date <= endDate.Value);

        var records = await query.OrderByDescending(x => x.Date).ToListAsync();

        return Ok(records.Select(r => new FeedWaterRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.FeedId,
            r.Feed?.Name,
            r.FeedQuantityKg,
            r.WaterQuantityLiters,
            r.BirdIdentifier,
            r.Medicine,
            r.Comments,
            r.CreatedAt
        )));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeedWaterRecordDto>> GetRecord(int id)
    {
        var r = await _context.FeedWaterRecords
            .Include(x => x.House)
            .Include(x => x.Personnel)
            .Include(x => x.Feed)
            .FirstOrDefaultAsync(x => x.Id == id);

        if (r == null) return NotFound();

        return new FeedWaterRecordDto(
            r.Id,
            r.HouseId,
            r.House?.Name,
            r.PersonnelId,
            r.Personnel?.FullName,
            r.Date,
            r.FeedId,
            r.Feed?.Name,
            r.FeedQuantityKg,
            r.WaterQuantityLiters,
            r.BirdIdentifier,
            r.Medicine,
            r.Comments,
            r.CreatedAt
        );
    }

    [HttpPost]
    public async Task<ActionResult<FeedWaterRecordDto>> CreateRecord(CreateFeedWaterDto dto)
    {
        var record = new FeedWaterRecord
        {
            HouseId = dto.HouseId,
            PersonnelId = dto.PersonnelId,
            Date = dto.Date,
            FeedId = dto.FeedId,
            FeedQuantityKg = dto.FeedQuantityKg,
            WaterQuantityLiters = dto.WaterQuantityLiters,
            BirdIdentifier = dto.BirdIdentifier,
            Medicine = dto.Medicine,
            Comments = dto.Comments
        };

        _context.FeedWaterRecords.Add(record);
        await _context.SaveChangesAsync();

        await _context.Entry(record).Reference(r => r.House).LoadAsync();
        await _context.Entry(record).Reference(r => r.Personnel).LoadAsync();
        await _context.Entry(record).Reference(r => r.Feed).LoadAsync();

        return CreatedAtAction(nameof(GetRecord), new { id = record.Id }, new FeedWaterRecordDto(
            record.Id,
            record.HouseId,
            record.House?.Name,
            record.PersonnelId,
            record.Personnel?.FullName,
            record.Date,
            record.FeedId,
            record.Feed?.Name,
            record.FeedQuantityKg,
            record.WaterQuantityLiters,
            record.BirdIdentifier,
            record.Medicine,
            record.Comments,
            record.CreatedAt
        ));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRecord(int id, UpdateFeedWaterDto dto)
    {
        var record = await _context.FeedWaterRecords.FindAsync(id);
        if (record == null) return NotFound();

        record.HouseId = dto.HouseId;
        record.PersonnelId = dto.PersonnelId;
        record.Date = dto.Date;
        record.FeedId = dto.FeedId;
        record.FeedQuantityKg = dto.FeedQuantityKg;
        record.WaterQuantityLiters = dto.WaterQuantityLiters;
        record.BirdIdentifier = dto.BirdIdentifier;
        record.Medicine = dto.Medicine;
        record.Comments = dto.Comments;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRecord(int id)
    {
        var record = await _context.FeedWaterRecords.FindAsync(id);
        if (record == null) return NotFound();

        _context.FeedWaterRecords.Remove(record);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}