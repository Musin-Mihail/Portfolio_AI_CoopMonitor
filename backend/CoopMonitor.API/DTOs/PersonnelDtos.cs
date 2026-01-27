using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.DTOs;

public record PersonnelDto(
    int Id,
    string FullName,
    string? JobTitle,
    string? PhoneNumber,
    string? Email,
    string? UserId,
    bool IsActive
);

public record CreatePersonnelDto(
    [Required] string FullName,
    string? JobTitle,
    string? PhoneNumber,
    [EmailAddress] string? Email,
    string? UserId
);

public record UpdatePersonnelDto(
    [Required] string FullName,
    string? JobTitle,
    string? PhoneNumber,
    [EmailAddress] string? Email,
    string? UserId,
    bool IsActive
);