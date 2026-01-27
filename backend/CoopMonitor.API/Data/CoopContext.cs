using CoopMonitor.API.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CoopMonitor.API.Data;

public class CoopContext : IdentityDbContext<User>
{
    public CoopContext(DbContextOptions<CoopContext> options) : base(options)
    {
    }

    public DbSet<House> Houses { get; set; }
    public DbSet<Personnel> Personnels { get; set; }
    public DbSet<Feed> Feeds { get; set; }

    // Журналы (Logs)
    public DbSet<MortalityRecord> MortalityRecords { get; set; }
    public DbSet<FeedWaterRecord> FeedWaterRecords { get; set; }
    public DbSet<DiseaseRecord> DiseaseRecords { get; set; }

    // Сложные журналы
    public DbSet<WeighingRecord> WeighingRecords { get; set; }
    public DbSet<MarkingRecord> MarkingRecords { get; set; }

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
            entity.Property(e => e.UserId).IsRequired(false);
            entity.HasIndex(e => e.UserId).IsUnique().HasFilter("[UserId] IS NOT NULL");
        });

        // Feed Configuration
        modelBuilder.Entity<Feed>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
        });

        // MortalityRecord Configuration
        modelBuilder.Entity<MortalityRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Quantity).IsRequired();

            entity.HasOne(e => e.House)
                  .WithMany()
                  .HasForeignKey(e => e.HouseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Personnel)
                  .WithMany()
                  .HasForeignKey(e => e.PersonnelId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // FeedWaterRecord Configuration
        modelBuilder.Entity<FeedWaterRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).IsRequired();

            entity.HasOne(e => e.House)
                  .WithMany()
                  .HasForeignKey(e => e.HouseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Personnel)
                  .WithMany()
                  .HasForeignKey(e => e.PersonnelId)
                  .OnDelete(DeleteBehavior.SetNull);

            entity.HasOne(e => e.Feed)
                  .WithMany()
                  .HasForeignKey(e => e.FeedId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // DiseaseRecord Configuration
        modelBuilder.Entity<DiseaseRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Date).IsRequired();
            entity.Property(e => e.Diagnosis).IsRequired().HasMaxLength(200);

            entity.HasOne(e => e.House)
                  .WithMany()
                  .HasForeignKey(e => e.HouseId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Personnel)
                  .WithMany()
                  .HasForeignKey(e => e.PersonnelId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // WeighingRecord Configuration
        modelBuilder.Entity<WeighingRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.WeightGrams).IsRequired();
            entity.Property(e => e.VideoUrl).IsRequired().HasMaxLength(500);

            entity.HasOne(e => e.House)
                .WithMany()
                .HasForeignKey(e => e.HouseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Personnel)
                .WithMany()
                .HasForeignKey(e => e.PersonnelId)
                .OnDelete(DeleteBehavior.SetNull);
        });

        // MarkingRecord Configuration
        modelBuilder.Entity<MarkingRecord>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MarkingType).IsRequired().HasMaxLength(50);
            entity.Property(e => e.BirdAgeDays).IsRequired();

            entity.HasOne(e => e.House)
                .WithMany()
                .HasForeignKey(e => e.HouseId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Personnel)
                .WithMany()
                .HasForeignKey(e => e.PersonnelId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}