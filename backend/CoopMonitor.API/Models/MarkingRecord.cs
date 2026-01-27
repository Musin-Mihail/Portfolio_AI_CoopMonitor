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

    /// <summary>
    /// Возраст птицы в днях на момент маркировки (для валидации типа)
    /// </summary>
    [Required]
    public int BirdAgeDays { get; set; }

    /// <summary>
    /// Идентификатор птицы (если есть) или номер по порядку
    /// </summary>
    [MaxLength(50)]
    public string? BirdIdentifier { get; set; }

    /// <summary>
    /// Тип маркировки: "PaintRing" (0-14 дней) или "TapeNumber" (14+ дней)
    /// </summary>
    [Required]
    [MaxLength(50)]
    public required string MarkingType { get; set; }

    [MaxLength(50)]
    public string? Color { get; set; }

    /// <summary>
    /// Номер на кольце или написанный краской
    /// </summary>
    [MaxLength(50)]
    public string? RingNumber { get; set; }

    /// <summary>
    /// Фото маркировки
    /// </summary>
    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}