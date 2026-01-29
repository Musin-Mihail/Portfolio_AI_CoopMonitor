using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace CoopMonitor.API.Models;

[Table("SyncUsage")]
public class SyncUsage
{
    [Key]
    public int Id { get; set; }

    [Required]
    public DateTime Date { get; set; }

    public long BytesSent { get; set; }

    public long BytesReceived { get; set; }
}