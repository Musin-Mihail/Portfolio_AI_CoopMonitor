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

    [MaxLength(50)]
    public string? BirdIdentifier { get; set; }

    public double? Temperature { get; set; }

    public bool UpdateMarking { get; set; }

    [MaxLength(200)]
    public string? Symptoms { get; set; }

    [MaxLength(500)]
    public string? Actions { get; set; }

    [MaxLength(500)]
    public string? VetPrescriptions { get; set; }

    [MaxLength(500)]
    public string? Notes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}