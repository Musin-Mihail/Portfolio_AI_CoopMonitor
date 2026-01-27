using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Data;

public class CoopContext : DbContext
{
    public CoopContext(DbContextOptions<CoopContext> options) : base(options)
    {
    }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
    {
        base.OnConfiguring(optionsBuilder);
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        // Configurations will be added in Phase 1
    }
}