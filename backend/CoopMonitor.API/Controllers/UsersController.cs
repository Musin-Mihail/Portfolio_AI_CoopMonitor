using System.Security.Claims;
using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using CoopMonitor.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")]
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly CoopContext _context;
    private readonly IAuditService _auditService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        CoopContext context,
        IAuditService auditService,
        ILogger<UsersController> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _auditService = auditService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _context.Users
            .Include(u => u.Personnel)
            .AsNoTracking()
            .ToListAsync();

        var userDtos = new List<UserDto>();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var mainRole = roles.FirstOrDefault() ?? "None";

            userDtos.Add(new UserDto(
                user.Id,
                user.UserName!,
                user.Email,
                mainRole,
                user.Personnel?.Id,
                user.Personnel?.FullName
            ));
        }

        return Ok(userDtos);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        if (await _userManager.FindByNameAsync(dto.UserName) != null)
            return BadRequest("Username is already taken.");

        if (await _userManager.FindByEmailAsync(dto.Email) != null)
            return BadRequest("Email is already taken.");

        var user = new User { UserName = dto.UserName, Email = dto.Email };
        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded) return BadRequest(result.Errors);

        if (!await _roleManager.RoleExistsAsync(dto.Role))
            await _roleManager.CreateAsync(new IdentityRole(dto.Role));

        await _userManager.AddToRoleAsync(user, dto.Role);

        string? personnelName = null;
        if (dto.PersonnelId.HasValue)
        {
            var personnel = await _context.Personnels.FindAsync(dto.PersonnelId.Value);
            if (personnel != null)
            {
                personnel.UserId = user.Id;
                personnelName = personnel.FullName;
                await _context.SaveChangesAsync();
            }
        }

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _auditService.LogAsync(adminId, User.Identity?.Name, "CreateUser", user.UserName, $"Role: {dto.Role}");

        return Ok(new UserDto(user.Id, user.UserName, user.Email, dto.Role, dto.PersonnelId, personnelName));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        if (user.Email != dto.Email && await _userManager.FindByEmailAsync(dto.Email) != null)
        {
            return BadRequest("Email is already taken.");
        }

        user.UserName = dto.UserName;
        user.Email = dto.Email;

        if (!string.IsNullOrEmpty(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
        }

        await _userManager.UpdateAsync(user);

        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains(dto.Role))
        {
            await _userManager.RemoveFromRolesAsync(user, roles);
            if (!await _roleManager.RoleExistsAsync(dto.Role))
                await _roleManager.CreateAsync(new IdentityRole(dto.Role));
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        var currentLinkedPersonnel = await _context.Personnels.FirstOrDefaultAsync(p => p.UserId == user.Id);

        if (dto.PersonnelId.HasValue)
        {
            if (currentLinkedPersonnel?.Id != dto.PersonnelId.Value)
            {
                if (currentLinkedPersonnel != null)
                {
                    currentLinkedPersonnel.UserId = null;
                }

                var newPersonnel = await _context.Personnels.FindAsync(dto.PersonnelId.Value);
                if (newPersonnel != null)
                {
                    newPersonnel.UserId = user.Id;
                }
            }
        }
        else
        {
            if (currentLinkedPersonnel != null)
            {
                currentLinkedPersonnel.UserId = null;
            }
        }

        await _context.SaveChangesAsync();

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _auditService.LogAsync(adminId, User.Identity?.Name, "UpdateUser", user.UserName);

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        if (User.Identity?.Name == user.UserName)
            return BadRequest("Cannot delete your own account.");

        var personnel = await _context.Personnels.FirstOrDefaultAsync(p => p.UserId == id);
        if (personnel != null)
        {
            personnel.UserId = null;
            await _context.SaveChangesAsync();
        }

        await _userManager.DeleteAsync(user);

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _auditService.LogAsync(adminId, User.Identity?.Name, "DeleteUser", user.UserName);

        return NoContent();
    }
}