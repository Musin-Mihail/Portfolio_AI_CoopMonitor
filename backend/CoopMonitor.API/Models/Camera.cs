using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

public class Camera
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Тип камеры: "RGB" или "Thermal"
    /// </summary>
    [Required]
    [MaxLength(20)]
    public string Type { get; set; } = "RGB";

    /// <summary>
    /// Привязка к птичнику (необязательно, камера может быть уличной/общей)
    /// </summary>
    public int? HouseId { get; set; }

    [ForeignKey("HouseId")]
    public House? House { get; set; }

    // --- Данные для подключения (RTSP/ONVIF) ---

    [Required]
    [MaxLength(50)]
    public string IpAddress { get; set; } = string.Empty;

    public int Port { get; set; } = 554; // Стандартный RTSP порт

    [MaxLength(50)]
    public string? Username { get; set; }

    [MaxLength(100)]
    public string? Password { get; set; } // В реальном проекте здесь должно быть шифрование

    /// <summary>
    /// Специфический путь потока, например: "/h264/ch1/main/av_stream"
    /// </summary>
    [MaxLength(200)]
    public string? StreamPath { get; set; }

    /// <summary>
    /// Если камера имеет нестандартный URL, который нельзя собрать из полей выше.
    /// Если заполнено, используется приоритетно.
    /// </summary>
    [MaxLength(500)]
    public string? RtspUrlOverride { get; set; }

    // --- Поля для Видеостены ---

    /// <summary>
    /// Порядок отображения на видеостене
    /// </summary>
    public int Position { get; set; } = 0;

    /// <summary>
    /// Включена ли камера
    /// </summary>
    public bool IsActive { get; set; } = true;

    // Метаданные
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}