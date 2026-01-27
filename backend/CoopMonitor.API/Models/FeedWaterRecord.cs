using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("FeedWaterRecords")]
public class FeedWaterRecord
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
    /// Тип корма (ссылка на справочник)
    /// </summary>
    public int? FeedId { get; set; }

    [ForeignKey(nameof(FeedId))]
    public Feed? Feed { get; set; }

    /// <summary>
    /// Выдано корма (кг)
    /// </summary>
    public double FeedQuantityKg { get; set; }

    /// <summary>
    /// Потреблено воды (литры)
    /// </summary>
    public double WaterQuantityLiters { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}