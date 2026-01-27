using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("Reports")]
public class ReportMetadata
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    /// <summary>
    /// Тип отчета: "Daily", "Weekly", "Monthly", "Final"
    /// </summary>
    [Required]
    [MaxLength(50)]
    public required string ReportType { get; set; }

    /// <summary>
    /// Дата, за которую сформирован отчет (или начало периода)
    /// </summary>
    [Required]
    public DateTime ReportDate { get; set; }

    /// <summary>
    /// Дата генерации
    /// </summary>
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Путь к файлу в бакете 'reports'
    /// </summary>
    [Required]
    [MaxLength(500)]
    public required string FilePath { get; set; }

    /// <summary>
    /// Статус генерации (Success, Failed)
    /// </summary>
    [MaxLength(20)]
    public string Status { get; set; } = "Success";
}