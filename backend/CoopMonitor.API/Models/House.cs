using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("Houses")]
public class House
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public required string Name { get; set; }

    /// <summary>
    /// Площадь в квадратных метрах
    /// </summary>
    public double Area { get; set; }

    /// <summary>
    /// Максимальная вместимость (голов)
    /// </summary>
    public int Capacity { get; set; }

    /// <summary>
    /// JSON конфигурация привязанных камер и датчиков
    /// </summary>
    public string? ConfigurationJson { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}