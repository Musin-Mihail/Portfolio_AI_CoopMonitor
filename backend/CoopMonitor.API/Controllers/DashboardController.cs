using CoopMonitor.API.DTOs;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ICalculationService _calculationService;

    public DashboardController(ICalculationService calculationService)
    {
        _calculationService = calculationService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<IEnumerable<DashboardSummaryDto>>> GetAllSummaries()
    {
        var summaries = await _calculationService.GetAllHousesSummaryAsync();
        return Ok(summaries);
    }

    [HttpGet("summary/{houseId}")]
    public async Task<ActionResult<DashboardSummaryDto>> GetSummary(int houseId)
    {
        try
        {
            var summary = await _calculationService.GetHouseSummaryAsync(houseId);
            return Ok(summary);
        }
        catch (KeyNotFoundException)
        {
            return NotFound($"House with ID {houseId} not found.");
        }
    }

    [HttpGet("history/{houseId}")]
    public async Task<ActionResult<IEnumerable<ClimateHistoryPoint>>> GetHistory(
        int houseId,
        [FromQuery] int hours = 24,
        [FromQuery] int interval = 0)
    {
        var history = await _calculationService.GetHouseHistoryAsync(houseId, hours, interval);
        return Ok(history);
    }

    // НОВЫЙ ЭНДПОИНТ: Сравнение всех курятников
    [HttpGet("history/comparison")]
    public async Task<ActionResult<IEnumerable<ComparisonHistoryDto>>> GetComparisonHistory(
        [FromQuery] string type = "temperature",
        [FromQuery] int hours = 24,
        [FromQuery] int interval = 30)
    {
        // Для сравнения агрегация по умолчанию 30 мин, чтобы не перегружать график
        if (interval == 0) interval = 30;

        var history = await _calculationService.GetComparisonHistoryAsync(type, hours, interval);
        return Ok(history);
    }
}