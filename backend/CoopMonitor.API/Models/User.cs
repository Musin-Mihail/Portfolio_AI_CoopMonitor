using Microsoft.AspNetCore.Identity;

namespace CoopMonitor.API.Models;

public class User : IdentityUser
{
    // Навигационное свойство для связи с персоналом
    public virtual Personnel? Personnel { get; set; }
}