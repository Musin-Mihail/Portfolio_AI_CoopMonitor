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

      public DbSet<MortalityRecord> MortalityRecords { get; set; }
      public DbSet<FeedWaterRecord> FeedWaterRecords { get; set; }
      public DbSet<DiseaseRecord> DiseaseRecords { get; set; }
      public DbSet<BatchInfoRecord> BatchInfoRecords { get; set; }

      public DbSet<WeighingRecord> WeighingRecords { get; set; }
      public DbSet<MarkingRecord> MarkingRecords { get; set; }

      public DbSet<SensorReading> SensorReadings { get; set; }
      public DbSet<AudioEvent> AudioEvents { get; set; }

      public DbSet<ReportMetadata> Reports { get; set; }

      public DbSet<AuditLog> AuditLogs { get; set; }

      public DbSet<SyncUsage> SyncUsages { get; set; }

      protected override void OnModelCreating(ModelBuilder modelBuilder)
      {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<House>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                  entity.Property(e => e.Area).IsRequired();
                  entity.Property(e => e.Capacity).IsRequired();
            });

            modelBuilder.Entity<Personnel>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.FullName).IsRequired().HasMaxLength(150);
                  entity.Property(e => e.UserId).IsRequired(false);

                  entity.HasOne(e => e.User)
                    .WithOne(u => u.Personnel)
                    .HasForeignKey<Personnel>(e => e.UserId)
                    .OnDelete(DeleteBehavior.SetNull);

                  entity.HasIndex(e => e.UserId).IsUnique().HasFilter("[UserId] IS NOT NULL");
            });

            modelBuilder.Entity<Feed>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                  entity.Property(e => e.Type).IsRequired().HasMaxLength(50);
            });

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

            modelBuilder.Entity<BatchInfoRecord>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Date).IsRequired();
                  entity.Property(e => e.DeliveryDate).IsRequired();
                  entity.Property(e => e.Quantity).IsRequired();
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

            modelBuilder.Entity<SensorReading>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Date).IsRequired();
                  entity.HasIndex(e => new { e.HouseId, e.Date });

                  entity.HasOne(e => e.House)
                    .WithMany()
                    .HasForeignKey(e => e.HouseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AudioEvent>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Classification).IsRequired();
                  entity.HasIndex(e => new { e.HouseId, e.Timestamp });

                  entity.HasOne(e => e.House)
                    .WithMany()
                    .HasForeignKey(e => e.HouseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<ReportMetadata>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.ReportType).IsRequired();
                  entity.Property(e => e.FilePath).IsRequired();

                  entity.HasOne(e => e.House)
                    .WithMany()
                    .HasForeignKey(e => e.HouseId)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<AuditLog>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Action).IsRequired().HasMaxLength(50);
                  entity.HasIndex(e => e.Timestamp);
            });

            modelBuilder.Entity<SyncUsage>(entity =>
            {
                  entity.HasKey(e => e.Id);
                  entity.Property(e => e.Date).IsRequired();
                  entity.HasIndex(e => e.Date).IsUnique();
            });
      }
}