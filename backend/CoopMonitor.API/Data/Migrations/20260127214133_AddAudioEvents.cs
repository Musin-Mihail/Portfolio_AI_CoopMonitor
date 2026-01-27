using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoopMonitor.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddAudioEvents : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AudioEvents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    HouseId = table.Column<int>(type: "INTEGER", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    Classification = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Confidence = table.Column<double>(type: "REAL", nullable: false),
                    ClipUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AudioEvents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AudioEvents_Houses_HouseId",
                        column: x => x.HouseId,
                        principalTable: "Houses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AudioEvents_HouseId_Timestamp",
                table: "AudioEvents",
                columns: new[] { "HouseId", "Timestamp" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AudioEvents");
        }
    }
}
