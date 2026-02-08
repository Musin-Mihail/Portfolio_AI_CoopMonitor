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
public class CamerasController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<CamerasController> _logger;

    public CamerasController(CoopContext context, ILogger<CamerasController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CameraDto>>> GetCameras()
    {
        var cameras = await _context.Cameras
            .Include(c => c.House)
            .OrderBy(c => c.Position)
            .AsNoTracking()
            .ToListAsync();

        return Ok(cameras.Select(MapToDto));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CameraDto>> GetCamera(int id)
    {
        var camera = await _context.Cameras
            .Include(c => c.House)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (camera == null) return NotFound();

        return MapToDto(camera);
    }

    [HttpPost]
    public async Task<ActionResult<CameraDto>> CreateCamera(CreateCameraDto dto)
    {
        var camera = new Camera
        {
            Name = dto.Name,
            Type = dto.Type,
            HouseId = dto.HouseId,
            IpAddress = dto.IpAddress,
            Port = dto.Port,
            Username = dto.Username,
            Password = dto.Password,
            StreamPath = dto.StreamPath,
            RtspUrlOverride = dto.RtspUrlOverride,
            Position = dto.Position,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        _context.Cameras.Add(camera);
        await _context.SaveChangesAsync();

        if (camera.HouseId.HasValue)
            await _context.Entry(camera).Reference(c => c.House).LoadAsync();

        _logger.LogInformation("Camera created: {Id} - {Name}", camera.Id, camera.Name);

        return CreatedAtAction(nameof(GetCamera), new { id = camera.Id }, MapToDto(camera));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCamera(int id, UpdateCameraDto dto)
    {
        var camera = await _context.Cameras.FindAsync(id);
        if (camera == null) return NotFound();

        camera.Name = dto.Name;
        camera.Type = dto.Type;
        camera.HouseId = dto.HouseId;
        camera.IpAddress = dto.IpAddress;
        camera.Port = dto.Port;
        camera.Username = dto.Username;
        if (!string.IsNullOrEmpty(dto.Password))
        {
            camera.Password = dto.Password;
        }
        camera.StreamPath = dto.StreamPath;
        camera.RtspUrlOverride = dto.RtspUrlOverride;
        camera.Position = dto.Position;
        camera.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCamera(int id)
    {
        var camera = await _context.Cameras.FindAsync(id);
        if (camera == null) return NotFound();

        _context.Cameras.Remove(camera);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static CameraDto MapToDto(Camera c)
    {
        string connectionString;
        if (!string.IsNullOrEmpty(c.RtspUrlOverride))
        {
            connectionString = c.RtspUrlOverride;
        }
        else
        {
            var authPart = (!string.IsNullOrEmpty(c.Username) && !string.IsNullOrEmpty(c.Password))
                ? $"{c.Username}:{c.Password}@"
                : "";

            var pathPart = c.StreamPath?.StartsWith("/") == true ? c.StreamPath.Substring(1) : c.StreamPath;

            connectionString = $"rtsp://{authPart}{c.IpAddress}:{c.Port}/{pathPart}";
        }

        return new CameraDto(
            c.Id, c.Name, c.Type, c.HouseId, c.House?.Name,
            c.IpAddress, c.Port, c.StreamPath, c.Username,
            c.Position, c.IsActive, connectionString
        );
    }
}