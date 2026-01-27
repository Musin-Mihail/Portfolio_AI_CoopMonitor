using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")] // Только админы могут смотреть логи
public class AuditController : ControllerBase
{
    private readonly CoopContext _context;

    public AuditController(CoopContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<AuditLogDto>>> GetLogs([FromQuery] int limit = 100)
    {
        // Ограничиваем выборку
        var logs = await _context.AuditLogs
            .AsNoTracking()
            .OrderByDescending(l => l.Timestamp)
            .Take(limit)
            .ToListAsync();

        return Ok(logs.Select(l => new AuditLogDto(
            l.Id,
            l.UserId,
            l.UserName,
            l.Action,
            l.Resource,
            l.Details,
            l.IpAddress,
            l.Timestamp
        )));
    }
}