using System.ComponentModel.DataAnnotations;

namespace CoopMonitor.API.Models;

public class Personnel
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    public string? JobTitle { get; set; }

    public string? PhoneNumber { get; set; }

    [EmailAddress]
    public string? Email { get; set; }

    public bool IsActive { get; set; } = true;

    // Внешний ключ на IdentityUser
    public string? UserId { get; set; }

    // Навигационное свойство
    public virtual User? User { get; set; }
}