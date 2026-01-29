using Microsoft.AspNetCore.Identity;

namespace CoopMonitor.API.Models;

public class User : IdentityUser
{
    public virtual Personnel? Personnel { get; set; }
}