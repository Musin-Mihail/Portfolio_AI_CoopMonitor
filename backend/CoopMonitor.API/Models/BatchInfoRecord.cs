using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("BatchInfoRecords")]
public class BatchInfoRecord
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    /// <summary>
    /// Дата поступления партии
    /// </summary>
    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Количество голов (контрольная группа)
    /// </summary>
    [Required]
    public int Quantity { get; set; }

    /// <summary>
    /// Возраст (0 дней — суточные)
    /// </summary>
    [Required]
    public int BirdAgeDays { get; set; }

    /// <summary>
    /// Ответственный ветеринар / сотрудник
    /// </summary>
    public int? PersonnelId { get; set; }

    [ForeignKey(nameof(PersonnelId))]
    public Personnel? Personnel { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}