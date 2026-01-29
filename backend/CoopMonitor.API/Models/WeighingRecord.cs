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

    [Required]
    public double WeightGrams { get; set; }

    public bool IsMusicPlayed { get; set; }

    [Required]
    [MaxLength(500)]
    public required string VideoUrl { get; set; }

    // --- New Fields from CSV ---
    [MaxLength(50)]
    public string? BirdIdentifier { get; set; } // № птицы

    public double? Temperature { get; set; } // Температура

    public bool UpdateMarking { get; set; } // Обновление маркировки (да/нет)

    [MaxLength(200)]
    public string? Symptoms { get; set; } // Симптомы заболевания

    [MaxLength(500)]
    public string? Actions { get; set; } // Действия

    [MaxLength(500)]
    public string? VetPrescriptions { get; set; } // Назначения ветеринара

    [MaxLength(500)]
    public string? Notes { get; set; } // Примечание
    // ---------------------------

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}