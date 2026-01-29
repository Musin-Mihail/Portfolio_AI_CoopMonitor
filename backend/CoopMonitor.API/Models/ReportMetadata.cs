using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("Reports")]
public class ReportMetadata
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    [Required]
    [MaxLength(50)]
    public required string ReportType { get; set; }

    [Required]
    public DateTime ReportDate { get; set; }

    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;

    [Required]
    [MaxLength(500)]
    public required string FilePath { get; set; }

    [MaxLength(20)]
    public string Status { get; set; } = "Success";

    public bool IsSynced { get; set; } = false;

    public DateTime? SyncedAt { get; set; }
}