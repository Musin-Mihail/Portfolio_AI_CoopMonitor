using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("SensorReadings")]
public class SensorReading
{
    [Key]
    public long Id { get; set; }

    [Required]
    public int HouseId { get; set; }

    [ForeignKey(nameof(HouseId))]
    public House? House { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public double Temperature { get; set; }

    public double Humidity { get; set; }

    public double Co2 { get; set; }

    public double Nh3 { get; set; }

    public bool IsValid { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}