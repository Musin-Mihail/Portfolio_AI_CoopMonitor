using CoopMonitor.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Data;

public class CoopContext : DbContext
{
    public CoopContext(DbContextOptions<CoopContext> options) : base(options)
    {
    }

    public DbSet<House> Houses { get; set; }
    public DbSet<Personnel> Personnels { get; set; }
    public DbSet<Feed> Feeds { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // House Configuration
        modelBuilder.Entity<House>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Area).IsRequired();
            entity.Property(e => e.Capacity).IsRequired();
        });

        // Personnel Configuration
        modelBuilder.Entity<Personnel>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
            entity.Property(e => e.UserId).IsRequired(false); // Explicitly nullable

            // Index for fast lookup by UserID
            entity.HasIndex(e => e.UserId).IsUnique().HasFilter("[UserId] IS NOT NULL");
        });

        // Feed Configuration
        modelBuilder.Entity<Feed>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
        });
    }
}