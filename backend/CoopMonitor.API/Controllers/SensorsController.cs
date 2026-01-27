using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using CoopMonitor.API.Services.Alerting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class SensorsController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ICalculationService _calculationService;
    private readonly IAlertService _alertService;
    private readonly ILogger<SensorsController> _logger;

    public SensorsController(
        CoopContext context,
        ICalculationService calculationService,
        IAlertService alertService,
        ILogger<SensorsController> logger)
    {
        _context = context;
        _calculationService = calculationService;
        _alertService = alertService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> PostReading([FromBody] SensorReadingDto dto)
    {
        // Time Sync Check
        var serverTime = DateTime.UtcNow;
        var timeDiff = Math.Abs((serverTime - dto.Timestamp).TotalSeconds);

        if (timeDiff > 60)
        {
            _logger.LogWarning("Time sync mismatch. Client: {Client}, Server: {Server}. Diff: {Diff}s", dto.Timestamp, serverTime, timeDiff);
        }

        // Validation
        bool isValid = _calculationService.ValidateSensorData(dto.Temperature, dto.Humidity, dto.Co2, dto.Nh3);

        var reading = new SensorReading
        {
            HouseId = dto.HouseId,
            Date = dto.Timestamp,
            Temperature = dto.Temperature,
            Humidity = dto.Humidity,
            Co2 = dto.Co2,
            Nh3 = dto.Nh3,
            IsValid = isValid
        };

        _context.SensorReadings.Add(reading);
        await _context.SaveChangesAsync();

        // Trigger Alert Checks asynchronously (Fire-and-forget logic for API response speed, 
        // or await if we want to guarantee notification logic executed)
        try
        {
            await _alertService.CheckSensorIngestionAsync(dto.HouseId, reading);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during alert check in SensorsController");
        }

        return Ok(new { status = "Received", id = reading.Id, valid = isValid });
    }
}