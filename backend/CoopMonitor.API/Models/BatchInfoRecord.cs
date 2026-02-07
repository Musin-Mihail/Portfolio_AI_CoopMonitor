using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("BatchInfoRecords")]
public class BatchInfoRecord
{
    [Key]
    public int Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    [Required]
    public DateTime Date { get; set; }

    [Required]
    public DateTime DeliveryDate { get; set; }

    [Required]
    public int Quantity { get; set; }

    [Required]
    public int BirdAgeDays { get; set; }

    public int? PersonnelId { get; set; }

    [ForeignKey(nameof(PersonnelId))]
    public Personnel? Personnel { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}