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

    /// <summary>
    /// Classification: "Healthy", "Unhealthy" (e.g. coughing), "Panic", "Noise"
    /// </summary>
    [Required]
    [MaxLength(50)]
    public required string Classification { get; set; }

    /// <summary>
    /// Confidence score (0.0 - 1.0)
    /// </summary>
    public double Confidence { get; set; }

    /// <summary>
    /// Link to the audio clip in Storage if saved
    /// </summary>
    [MaxLength(500)]
    public string? ClipUrl { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}