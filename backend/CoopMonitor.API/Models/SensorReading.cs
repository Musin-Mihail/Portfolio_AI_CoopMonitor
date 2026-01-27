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

    /// <summary>
    /// Температура (°C)
    /// </summary>
    public double Temperature { get; set; }

    /// <summary>
    /// Влажность (%)
    /// </summary>
    public double Humidity { get; set; }

    /// <summary>
    /// Углекислый газ (ppm)
    /// </summary>
    public double Co2 { get; set; }

    /// <summary>
    /// Аммиак (ppm)
    /// </summary>
    public double Nh3 { get; set; }

    /// <summary>
    /// Статус валидности данных. 
    /// False, если датчики показывают 0 или аномальные значения.
    /// </summary>
    public bool IsValid { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}