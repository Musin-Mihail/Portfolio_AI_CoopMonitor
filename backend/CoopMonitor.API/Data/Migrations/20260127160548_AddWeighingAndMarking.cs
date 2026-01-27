using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoopMonitor.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddWeighingAndMarking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MarkingRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    HouseId = table.Column<int>(type: "INTEGER", nullable: false),
                    PersonnelId = table.Column<int>(type: "INTEGER", nullable: true),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    BirdAgeDays = table.Column<int>(type: "INTEGER", nullable: false),
                    BirdIdentifier = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    MarkingType = table.Column<string>(type: "TEXT", maxLength: 50, nullable: false),
                    Color = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    RingNumber = table.Column<string>(type: "TEXT", maxLength: 50, nullable: true),
                    AttachmentUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MarkingRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_MarkingRecords_Houses_HouseId",
                        column: x => x.HouseId,
                        principalTable: "Houses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_MarkingRecords_Personnel_PersonnelId",
                        column: x => x.PersonnelId,
                        principalTable: "Personnel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "WeighingRecords",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    HouseId = table.Column<int>(type: "INTEGER", nullable: false),
                    PersonnelId = table.Column<int>(type: "INTEGER", nullable: true),
                    Date = table.Column<DateTime>(type: "TEXT", nullable: false),
                    WeightGrams = table.Column<double>(type: "REAL", nullable: false),
                    IsMusicPlayed = table.Column<bool>(type: "INTEGER", nullable: false),
                    VideoUrl = table.Column<string>(type: "TEXT", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WeighingRecords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_WeighingRecords_Houses_HouseId",
                        column: x => x.HouseId,
                        principalTable: "Houses",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_WeighingRecords_Personnel_PersonnelId",
                        column: x => x.PersonnelId,
                        principalTable: "Personnel",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MarkingRecords_HouseId",
                table: "MarkingRecords",
                column: "HouseId");

            migrationBuilder.CreateIndex(
                name: "IX_MarkingRecords_PersonnelId",
                table: "MarkingRecords",
                column: "PersonnelId");

            migrationBuilder.CreateIndex(
                name: "IX_WeighingRecords_HouseId",
                table: "WeighingRecords",
                column: "HouseId");

            migrationBuilder.CreateIndex(
                name: "IX_WeighingRecords_PersonnelId",
                table: "WeighingRecords",
                column: "PersonnelId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MarkingRecords");

            migrationBuilder.DropTable(
                name: "WeighingRecords");
        }
    }
}
