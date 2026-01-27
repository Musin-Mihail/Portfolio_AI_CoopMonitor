using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("Personnel")]
public class Personnel
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public required string FullName { get; set; }

    [MaxLength(100)]
    public string? JobTitle { get; set; }

    [MaxLength(50)]
    public string? PhoneNumber { get; set; }

    [MaxLength(100)]
    [EmailAddress]
    public string? Email { get; set; }

    /// <summary>
    /// Ссылка на системного пользователя (Identity). 
    /// Nullable, так как персонал может существовать без учетной записи.
    /// </summary>
    [MaxLength(450)]
    public string? UserId { get; set; }

    public bool IsActive { get; set; } = true;
}