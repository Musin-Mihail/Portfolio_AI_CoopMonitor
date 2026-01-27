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
public class FeedsController : ControllerBase
{
    private readonly CoopContext _context;
    private readonly ILogger<FeedsController> _logger;

    public FeedsController(CoopContext context, ILogger<FeedsController> logger)
    {
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<FeedDto>>> GetFeeds()
    {
        return await _context.Feeds
            .AsNoTracking()
            .Select(f => new FeedDto(f.Id, f.Name, f.Type, f.Description))
            .ToListAsync();
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<FeedDto>> GetFeed(int id)
    {
        var feed = await _context.Feeds.FindAsync(id);
        if (feed == null) return NotFound();
        return new FeedDto(feed.Id, feed.Name, feed.Type, feed.Description);
    }

    [HttpPost]
    public async Task<ActionResult<FeedDto>> CreateFeed(CreateFeedDto dto)
    {
        var feed = new Feed
        {
            Name = dto.Name,
            Type = dto.Type,
            Description = dto.Description
        };

        _context.Feeds.Add(feed);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetFeed), new { id = feed.Id },
            new FeedDto(feed.Id, feed.Name, feed.Type, feed.Description));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateFeed(int id, UpdateFeedDto dto)
    {
        var feed = await _context.Feeds.FindAsync(id);
        if (feed == null) return NotFound();

        feed.Name = dto.Name;
        feed.Type = dto.Type;
        feed.Description = dto.Description;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteFeed(int id)
    {
        var feed = await _context.Feeds.FindAsync(id);
        if (feed == null) return NotFound();

        _context.Feeds.Remove(feed);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
