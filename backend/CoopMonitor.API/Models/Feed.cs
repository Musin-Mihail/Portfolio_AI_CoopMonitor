using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("Feeds")]
public class Feed
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Тип корма (Старт, Рост, Финиш и т.д.)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public required string Type { get; set; }

    [MaxLength(500)]
    public string? Description { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}