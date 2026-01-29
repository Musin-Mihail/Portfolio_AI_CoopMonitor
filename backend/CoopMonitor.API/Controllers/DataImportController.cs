using System.Globalization;
using System.Text.RegularExpressions;
using CoopMonitor.API.Data;
using CoopMonitor.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DataImportController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<DataImportController> _logger;

    public DataImportController(CoopContext context, ILogger<DataImportController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpPost("upload/{houseId}")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> ImportSensorData(int houseId, [FromForm] IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest("File is empty.");

        var house = await _context.Houses.FindAsync(houseId);
        if (house == null)
            return NotFound($"House with ID {houseId} not found.");

        try
        {
            var readings = new List<SensorReading>();
            using (var stream = new StreamReader(file.OpenReadStream()))
            {
                string? header = await stream.ReadLineAsync();

                while (!stream.EndOfStream)
                {
                    var line = await stream.ReadLineAsync();
                    if (string.IsNullOrWhiteSpace(line)) continue;

                    var parts = Regex.Split(line, ",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                    if (parts.Length < 7) continue;

                    try
                    {
                        if (!DateTime.TryParse(parts[0].Trim('"'), CultureInfo.InvariantCulture, DateTimeStyles.None, out var timestamp))
                            continue;

                        var culture = new CultureInfo("ru-RU");

                        double ParseDouble(string val)
                        {
                            val = val.Trim('"').Trim();
                            if (double.TryParse(val, NumberStyles.Any, culture, out var result))
                                return result;
                            if (double.TryParse(val, NumberStyles.Any, CultureInfo.InvariantCulture, out var resultUs))
                                return resultUs;
                            return 0;
                        }

                        double humidity = ParseDouble(parts[2]);
                        double nh3 = ParseDouble(parts[3]);

                        double t1 = ParseDouble(parts[4]);
                        double t2 = ParseDouble(parts[5]);
                        double t3 = ParseDouble(parts[6]);

                        double avgTemp = (t1 + t2 + t3) / 3.0;
                        if (avgTemp == 0)
                        {
                            var temps = new[] { t1, t2, t3 }.Where(t => t > 0).ToList();
                            if (temps.Any()) avgTemp = temps.Average();
                        }

                        readings.Add(new SensorReading
                        {
                            HouseId = houseId,
                            Date = timestamp,
                            Temperature = avgTemp,
                            Humidity = humidity,
                            Nh3 = nh3,
                            Co2 = 0,
                            IsValid = true
                        });
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to parse line: {Line}", line);
                    }
                }
            }

            if (readings.Any())
            {
                await _context.SensorReadings.AddRangeAsync(readings);
                await _context.SaveChangesAsync();
            }

            return Ok(new { count = readings.Count, message = $"Imported {readings.Count} readings successfully." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error importing file.");
            return StatusCode(500, "Internal server error during import.");
        }
    }
}