using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

/// <summary>
/// Журнал учета трафика для контроля лимитов (Traffic Control).
/// </summary>
[Table("SyncUsage")]
public class SyncUsage
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// Дата учета (без времени)
    /// </summary>
    [Required]
    public DateTime Date { get; set; }

    /// <summary>
    /// Количество отправленных байт за эту дату
    /// </summary>
    public long BytesSent { get; set; }

    /// <summary>
    /// Количество принятых байт (опционально)
    /// </summary>
    public long BytesReceived { get; set; }
}