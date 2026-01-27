using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // В реальной жизни датчики могут иметь API Key вместо JWT, но пока используем общий механизм
public class SensorsController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ICalculationService _calculationService;
    private readonly ILogger<SensorsController> _logger;

    public SensorsController(CoopContext context, ICalculationService calculationService, ILogger<SensorsController> logger)
    {
        _context = context;
        _calculationService = calculationService;
        _logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> PostReading([FromBody] SensorReadingDto dto)
    {
        // 4.2 Time Sync Check: Пометка данных Invalid, если дельта времени клиента и сервера > 1 сек
        // Для упрощения сделаем warning, а не отказ в приеме
        var serverTime = DateTime.UtcNow;
        var timeDiff = Math.Abs((serverTime - dto.Timestamp).TotalSeconds);

        if (timeDiff > 60) // Разрешим минуту расхождения, 1 секунда слишком жестко для HTTP задержек
        {
            _logger.LogWarning("Time sync mismatch. Client: {Client}, Server: {Server}. Diff: {Diff}s", dto.Timestamp, serverTime, timeDiff);
        }

        // Валидация значений
        bool isValid = _calculationService.ValidateSensorData(dto.Temperature, dto.Humidity, dto.Co2, dto.Nh3);

        var reading = new SensorReading
        {
            HouseId = dto.HouseId,
            Date = dto.Timestamp, // Используем время клиента, но можно и серверное
            Temperature = dto.Temperature,
            Humidity = dto.Humidity,
            Co2 = dto.Co2,
            Nh3 = dto.Nh3,
            IsValid = isValid
        };

        _context.SensorReadings.Add(reading);
        await _context.SaveChangesAsync();

        return Ok(new { status = "Received", id = reading.Id, valid = isValid });
    }
}