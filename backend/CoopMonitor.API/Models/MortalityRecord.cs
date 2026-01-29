using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("MortalityRecords")]
public class MortalityRecord
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

    [Required]
    public int Quantity { get; set; }

    [MaxLength(200)]
    public string? Reason { get; set; }

    // --- New Fields from CSV ---
    [MaxLength(50)]
    public string? BirdIdentifier { get; set; } // № птицы

    [MaxLength(500)]
    public string? Circumstances { get; set; } // Обстоятельства

    [MaxLength(500)]
    public string? VetComment { get; set; } // Комментарий ветеринара
    // ---------------------------

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}