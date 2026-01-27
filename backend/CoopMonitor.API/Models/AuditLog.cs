using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("AuditLogs")]
public class AuditLog
{
    [Key]
    public long Id { get; set; }

    public string? UserId { get; set; }

    [MaxLength(100)]
    public string? UserName { get; set; }

    /// <summary>
    /// Тип действия: "Login", "Download", "Upload", "Create", "Delete"
    /// </summary>
    [Required]
    [MaxLength(50)]
    public required string Action { get; set; }

    /// <summary>
    /// Ресурс, над которым производится действие (например, имя файла или сущность)
    /// </summary>
    [MaxLength(200)]
    public string? Resource { get; set; }

    /// <summary>
    /// Детали или параметры запроса
    /// </summary>
    [MaxLength(500)]
    public string? Details { get; set; }

    [MaxLength(50)]
    public string? IpAddress { get; set; }

    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}