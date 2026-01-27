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

    /// <summary>
    /// Ответственный сотрудник (из справочника Personnel)
    /// </summary>
    public int? PersonnelId { get; set; }

    [ForeignKey(nameof(PersonnelId))]
    public Personnel? Personnel { get; set; }

    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Количество павших голов
    /// </summary>
    [Required]
    public int Quantity { get; set; }

    [MaxLength(200)]
    public string? Reason { get; set; }

    /// <summary>
    /// Ссылка на фото тушки/доказательства (путь в MinIO: user-uploads/...)
    /// </summary>
    [MaxLength(500)]
    public string? AttachmentUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}