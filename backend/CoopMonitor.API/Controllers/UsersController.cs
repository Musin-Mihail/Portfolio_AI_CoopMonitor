using CoopMonitor.API.Data;
using CoopMonitor.API.DTOs;
using CoopMonitor.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = "Admin")] // Только администраторы могут управлять пользователями
public class UsersController : ControllerBase
{
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<IdentityRole> _roleManager;
    private readonly CoopContext _context;
    private readonly ILogger<UsersController> _logger;

    public UsersController(
        UserManager<User> userManager,
        RoleManager<IdentityRole> roleManager,
        CoopContext context,
        ILogger<UsersController> logger)
    {
        _userManager = userManager;
        _roleManager = roleManager;
        _context = context;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<UserDto>>> GetUsers()
    {
        var users = await _userManager.Users.ToListAsync();
        var userDtos = new List<UserDto>();

        // Получаем всех сотрудников для маппинга
        var personnels = await _context.Personnels
            .Where(p => p.UserId != null)
            .ToListAsync();

        foreach (var user in users)
        {
            var roles = await _userManager.GetRolesAsync(user);
            var mainRole = roles.FirstOrDefault() ?? "None";

            var personnel = personnels.FirstOrDefault(p => p.UserId == user.Id);

            userDtos.Add(new UserDto(
                user.Id,
                user.UserName!,
                user.Email,
                mainRole,
                personnel?.Id,
                personnel?.FullName
            ));
        }

        return Ok(userDtos);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser(CreateUserDto dto)
    {
        if (await _userManager.FindByNameAsync(dto.UserName) != null)
        {
            return BadRequest("Username is already taken.");
        }

        if (await _userManager.FindByEmailAsync(dto.Email) != null)
        {
            return BadRequest("Email is already taken.");
        }

        var user = new User
        {
            UserName = dto.UserName,
            Email = dto.Email
        };

        var result = await _userManager.CreateAsync(user, dto.Password);

        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        // Назначение роли
        if (!await _roleManager.RoleExistsAsync(dto.Role))
        {
            // Если роли нет, создадим (для упрощения MVP, в проде лучше через миграции)
            await _roleManager.CreateAsync(new IdentityRole(dto.Role));
        }
        await _userManager.AddToRoleAsync(user, dto.Role);

        _logger.LogInformation("User created: {User}", dto.UserName);

        return Ok(new UserDto(
            user.Id,
            user.UserName,
            user.Email,
            dto.Role,
            null,
            null
        ));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        // Запрет удаления самого себя (простая проверка)
        if (User.Identity?.Name == user.UserName)
        {
            return BadRequest("Cannot delete your own account.");
        }

        // Отвязываем сотрудника, если есть
        var personnel = await _context.Personnels.FirstOrDefaultAsync(p => p.UserId == id);
        if (personnel != null)
        {
            personnel.UserId = null;
            // Можно не сохранять явно, если каскад не настроен, но лучше сохранить
        }

        var result = await _userManager.DeleteAsync(user);
        if (!result.Succeeded)
        {
            return BadRequest(result.Errors);
        }

        // Сохраняем отвязку сотрудника
        await _context.SaveChangesAsync();

        _logger.LogInformation("User deleted: {User}", user.UserName);
        return NoContent();
    }
}