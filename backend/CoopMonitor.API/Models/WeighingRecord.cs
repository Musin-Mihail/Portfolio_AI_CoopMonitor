using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("WeighingRecords")]
public class WeighingRecord
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    public int? PersonnelId { get; set; }

    [ForeignKey(nameof(PersonnelId))]
    public Personnel? Personnel { get; set; }

    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Средний вес (граммы) или вес конкретной выборки
    /// </summary>
    [Required]
    public double WeightGrams { get; set; }

    /// <summary>
    /// Отметка о включении музыки для снижения стресса (согласно протоколу)
    /// </summary>
    public bool IsMusicPlayed { get; set; }

    /// <summary>
    /// Ссылка на видео процесса взвешивания (Обязательно)
    /// </summary>
    [Required]
    [MaxLength(500)]
    public required string VideoUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}