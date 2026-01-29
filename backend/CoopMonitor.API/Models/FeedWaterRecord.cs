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

    public int? FeedId { get; set; }

    [ForeignKey(nameof(FeedId))]
    public Feed? Feed { get; set; }

    public double FeedQuantityKg { get; set; }

    public double WaterQuantityLiters { get; set; }

    [MaxLength(50)]
    public string? BirdIdentifier { get; set; }

    [MaxLength(200)]
    public string? Medicine { get; set; }

    [MaxLength(500)]
    public string? Comments { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}