using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize] // Требует JWT токен для доступа
public class HousesController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<HousesController> _logger;

    public HousesController(CoopContext context, ILogger<HousesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HouseDto>>> GetHouses()
    {
        return await _context.Houses
            .AsNoTracking()
            .Select(h => new HouseDto(h.Id, h.Name, h.Area, h.Capacity, h.ConfigurationJson, h.CreatedAt))
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HouseDto>> GetHouse(int id)
    {
        var house = await _context.Houses.FindAsync(id);

        if (house == null)
        {
            return NotFound();
        }

        return new HouseDto(house.Id, house.Name, house.Area, house.Capacity, house.ConfigurationJson, house.CreatedAt);
    }

    [HttpPost]
    public async Task<ActionResult<HouseDto>> CreateHouse(CreateHouseDto dto)
    {
        var house = new House
        {
            Name = dto.Name,
            Area = dto.Area,
            Capacity = dto.Capacity,
            ConfigurationJson = dto.ConfigurationJson
        };

        _context.Houses.Add(house);
        await _context.SaveChangesAsync();

        _logger.LogInformation("House created: {Id} - {Name}", house.Id, house.Name);

        return CreatedAtAction(nameof(GetHouse), new { id = house.Id },
            new HouseDto(house.Id, house.Name, house.Area, house.Capacity, house.ConfigurationJson, house.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHouse(int id, UpdateHouseDto dto)
    {
        var house = await _context.Houses.FindAsync(id);
        if (house == null)
        {
            return NotFound();
        }

        house.Name = dto.Name;
        house.Area = dto.Area;
        house.Capacity = dto.Capacity;
        house.ConfigurationJson = dto.ConfigurationJson;
        house.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _context.SaveChangesAsync();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!HouseExists(id)) return NotFound();
            else throw;
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHouse(int id)
    {
        var house = await _context.Houses.FindAsync(id);
        if (house == null)
        {
            return NotFound();
        }

        _context.Houses.Remove(house);
        await _context.SaveChangesAsync();

        _logger.LogInformation("House deleted: {Id}", id);

        return NoContent();
    }

    private bool HouseExists(int id)
    {
        return _context.Houses.Any(e => e.Id == id);
    }
}