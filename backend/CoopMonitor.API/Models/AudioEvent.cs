using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("AudioEvents")]
public class AudioEvent
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    [Required]
    public DateTime Timestamp { get; set; }

    [Required]
    [MaxLength(50)]
    public required string Classification { get; set; }

    public double Confidence { get; set; }

    [MaxLength(500)]
    public string? ClipUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}