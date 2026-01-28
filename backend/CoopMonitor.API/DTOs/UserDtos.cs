using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record UserDto(
    string Id,
    string UserName,
    string? Email,
    string Role,
    int? PersonnelId,
    string? PersonnelName
);

public record CreateUserDto(
    [Required] string UserName,
    [Required][EmailAddress] string Email,
    [Required] string Password,
    [Required] string Role
);

// Добавлено DTO для обновления
public record UpdateUserDto(
    [Required] string UserName,
    [Required][EmailAddress] string Email,
    string? Password, // Опционально: если пустой, пароль не меняем
    [Required] string Role
);