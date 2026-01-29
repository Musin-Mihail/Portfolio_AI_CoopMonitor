using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("MarkingRecords")]
public class MarkingRecord
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
    public int BirdAgeDays { get; set; }

    [MaxLength(50)]
    public string? BirdIdentifier { get; set; } // № (Первичная маркировка)

    [Required]
    [MaxLength(50)]
    public required string MarkingType { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    [MaxLength(50)]
    public string? RingNumber { get; set; }

    // --- New Field from CSV ---
    [MaxLength(500)]
    public string? Notes { get; set; } // Примечания
    // --------------------------

    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}