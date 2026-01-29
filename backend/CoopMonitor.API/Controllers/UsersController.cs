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
        // Используем Include для подгрузки связанного персонала
        // Так как User связан с IdentityDbContext, а Personnel через CoopContext,
        // но CoopContext наследует IdentityDbContext<User>, мы можем использовать _context.Users
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

        // Связывание с персоналом
        string? personnelName = null;
        if (dto.PersonnelId.HasValue)
        {
            var personnel = await _context.Personnels.FindAsync(dto.PersonnelId.Value);
            if (personnel != null)
            {
                // Если у персонала уже был пользователь, нужно решить конфликт.
                // В данной логике просто перезаписываем.
                personnel.UserId = user.Id;
                personnelName = personnel.FullName;
                await _context.SaveChangesAsync();
            }
        }

        // Audit
        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _auditService.LogAsync(adminId, User.Identity?.Name, "CreateUser", user.UserName, $"Role: {dto.Role}");

        return Ok(new UserDto(user.Id, user.UserName, user.Email, dto.Role, dto.PersonnelId, personnelName));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, UpdateUserDto dto)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        // Проверка уникальности email, если он изменился
        if (user.Email != dto.Email && await _userManager.FindByEmailAsync(dto.Email) != null)
        {
            return BadRequest("Email is already taken.");
        }

        user.UserName = dto.UserName;
        user.Email = dto.Email;

        // Смена пароля, если передан
        if (!string.IsNullOrEmpty(dto.Password))
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var result = await _userManager.ResetPasswordAsync(user, token, dto.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
        }

        await _userManager.UpdateAsync(user);

        // Обновление роли
        var roles = await _userManager.GetRolesAsync(user);
        if (!roles.Contains(dto.Role))
        {
            await _userManager.RemoveFromRolesAsync(user, roles);
            if (!await _roleManager.RoleExistsAsync(dto.Role))
                await _roleManager.CreateAsync(new IdentityRole(dto.Role));
            await _userManager.AddToRoleAsync(user, dto.Role);
        }

        // Обновление связи с персоналом
        // 1. Найти текущую связь и обнулить, если она отличается
        var currentLinkedPersonnel = await _context.Personnels.FirstOrDefaultAsync(p => p.UserId == user.Id);

        if (dto.PersonnelId.HasValue)
        {
            // Если выбран новый персонал (или тот же самый)
            if (currentLinkedPersonnel?.Id != dto.PersonnelId.Value)
            {
                // Обнуляем старого (если был)
                if (currentLinkedPersonnel != null)
                {
                    currentLinkedPersonnel.UserId = null;
                }

                // Находим нового и привязываем
                var newPersonnel = await _context.Personnels.FindAsync(dto.PersonnelId.Value);
                if (newPersonnel != null)
                {
                    // Если этот сотрудник был привязан к другому юзеру, можно либо выдать ошибку, либо перезаписать.
                    // Перезаписываем (отбираем аккаунт).
                    newPersonnel.UserId = user.Id;
                }
            }
        }
        else
        {
            // Если пришел null, значит отвязываем текущего
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

        // Отвязываем персонал (SetNull в БД сделает это, но для надежности можно и явно)
        // EF Core Foreign Key OnDelete.SetNull обработает это, но мы используем IdentityManager для удаления User,
        // поэтому лучше явно разорвать связь перед удалением, чтобы избежать конфликтов валидации.
        var personnel = await _context.Personnels.FirstOrDefaultAsync(p => p.UserId == id);
        if (personnel != null)
        {
            personnel.UserId = null;
            await _context.SaveChangesAsync();
        }

        await _userManager.DeleteAsync(user);

        // SaveChanges для Identity не нужен (он внутри Manager), но нужен для обновления Personnels если мы меняли его
        // (уже вызвали выше).

        var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        await _auditService.LogAsync(adminId, User.Identity?.Name, "DeleteUser", user.UserName);

        return NoContent();
    }
}