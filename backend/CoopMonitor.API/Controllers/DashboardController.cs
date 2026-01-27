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
    public async Task<ActionResult<IEnumerable<ClimateHistoryPoint>>> GetHistory(int houseId, [FromQuery] int hours = 24)
    {
        var history = await _calculationService.GetHouseHistoryAsync(houseId, hours);
        return Ok(history);
    }
}