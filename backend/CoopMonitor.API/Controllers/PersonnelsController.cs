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
public class PersonnelsController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<PersonnelsController> _logger;

    public PersonnelsController(CoopContext context, ILogger<PersonnelsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PersonnelDto>>> GetPersonnels()
    {
        return await _context.Personnels
            .AsNoTracking()
            .Select(p => new PersonnelDto(p.Id, p.FullName, p.JobTitle, p.PhoneNumber, p.Email, p.UserId, p.IsActive))
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PersonnelDto>> GetPersonnel(int id)
    {
        var p = await _context.Personnels.FindAsync(id);

        if (p == null) return NotFound();

        return new PersonnelDto(p.Id, p.FullName, p.JobTitle, p.PhoneNumber, p.Email, p.UserId, p.IsActive);
    }

    [HttpPost]
    public async Task<ActionResult<PersonnelDto>> CreatePersonnel(CreatePersonnelDto dto)
    {
        var personnel = new Personnel
        {
            FullName = dto.FullName,
            JobTitle = dto.JobTitle,
            PhoneNumber = dto.PhoneNumber,
            Email = dto.Email,
            UserId = dto.UserId
        };

        _context.Personnels.Add(personnel);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Personnel created: {Id} - {Name}", personnel.Id, personnel.FullName);

        return CreatedAtAction(nameof(GetPersonnel), new { id = personnel.Id },
            new PersonnelDto(personnel.Id, personnel.FullName, personnel.JobTitle, personnel.PhoneNumber, personnel.Email, personnel.UserId, personnel.IsActive));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdatePersonnel(int id, UpdatePersonnelDto dto)
    {
        var personnel = await _context.Personnels.FindAsync(id);
        if (personnel == null) return NotFound();

        personnel.FullName = dto.FullName;
        personnel.JobTitle = dto.JobTitle;
        personnel.PhoneNumber = dto.PhoneNumber;
        personnel.Email = dto.Email;
        personnel.UserId = dto.UserId;
        personnel.IsActive = dto.IsActive;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeletePersonnel(int id)
    {
        var personnel = await _context.Personnels.FindAsync(id);
        if (personnel == null) return NotFound();

        _context.Personnels.Remove(personnel);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}