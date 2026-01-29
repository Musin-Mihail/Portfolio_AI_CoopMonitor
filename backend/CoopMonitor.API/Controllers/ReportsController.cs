using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Jobs;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quartz;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly IFileStorageService _fileStorage;
    private readonly ISchedulerFactory _schedulerFactory;
    private readonly ILogger<ReportsController> _logger;

    public ReportsController(
        CoopContext context,
        IFileStorageService fileStorage,
        ISchedulerFactory schedulerFactory,
        ILogger<ReportsController> logger)
    {
        _context = context;
        _fileStorage = fileStorage;
        _schedulerFactory = schedulerFactory;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ReportMetadataDto>>> GetReports(
        [FromQuery] int? houseId,
        [FromQuery] string? type,
        [FromQuery] DateTime? date)
    {
        var query = _context.Reports
            .Include(r => r.House)
            .AsNoTracking()
            .AsQueryable();

        if (houseId.HasValue) query = query.Where(r => r.HouseId == houseId.Value);
        if (!string.IsNullOrEmpty(type)) query = query.Where(r => r.ReportType == type);
        if (date.HasValue) query = query.Where(r => r.ReportDate.Date == date.Value.Date);

        var list = await query.OrderByDescending(r => r.GeneratedAt).ToListAsync();

        return Ok(list.Select(r => new ReportMetadataDto(
            r.Id,
            r.HouseId,
            r.House?.Name ?? "Unknown",
            r.ReportType,
            r.ReportDate,
            r.GeneratedAt,
            r.Status
        )));
    }

    [HttpGet("download/{id}")]
    public async Task<IActionResult> DownloadReport(int id)
    {
        var report = await _context.Reports.FindAsync(id);
        if (report == null) return NotFound();

        try
        {
            var (stream, contentType, fileName) = await _fileStorage.GetFileStreamAsync("reports", report.FilePath);
            return File(stream, contentType, fileName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to download report {Id}", id);
            return StatusCode(500, "Could not retrieve report file.");
        }
    }

    [HttpPost("generate")]
    public async Task<IActionResult> TriggerGeneration([FromBody] GenerateReportRequest request)
    {
        if (request.ReportType != "Daily")
            return BadRequest("Only 'Daily' reports are currently supported for manual trigger.");

        var scheduler = await _schedulerFactory.GetScheduler();

        var jobData = new JobDataMap();
        jobData.Put("Date", request.Date);

        await scheduler.TriggerJob(new JobKey("DailyReportJob"), jobData);

        return Ok(new { message = "Report generation triggered successfully." });
    }
}