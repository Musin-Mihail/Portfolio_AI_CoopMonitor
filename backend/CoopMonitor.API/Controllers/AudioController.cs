using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services.Alerting;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AudioController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly IAlertService _alertService;
    private readonly ILogger<AudioController> _logger;

    public AudioController(
        CoopContext context,
        IAlertService alertService,
        ILogger<AudioController> logger)
    {
        _context = context;
        _alertService = alertService;
        _logger = logger;
    }

    [HttpPost("ingest")]
    [AllowAnonymous]
    public async Task<IActionResult> Ingest([FromBody] CreateAudioEventDto dto)
    {
        _logger.LogInformation("Received audio event for House {HouseId}: {Class} ({Conf})",
            dto.HouseId, dto.Classification, dto.Confidence);

        var audioEvent = new AudioEvent
        {
            HouseId = dto.HouseId,
            Timestamp = dto.Timestamp,
            Classification = dto.Classification,
            Confidence = dto.Confidence,
            ClipUrl = dto.ClipUrl
        };

        _context.AudioEvents.Add(audioEvent);
        await _context.SaveChangesAsync();

        await _alertService.CheckAudioIngestionAsync(dto.HouseId, audioEvent);

        return Ok(new { id = audioEvent.Id });
    }
}