using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoopMonitor.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateLogsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Actions",
                table: "WeighingRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirdIdentifier",
                table: "WeighingRecords",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "WeighingRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Symptoms",
                table: "WeighingRecords",
                type: "TEXT",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "Temperature",
                table: "WeighingRecords",
                type: "REAL",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "UpdateMarking",
                table: "WeighingRecords",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "VetPrescriptions",
                table: "WeighingRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirdIdentifier",
                table: "MortalityRecords",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Circumstances",
                table: "MortalityRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VetComment",
                table: "MortalityRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "MarkingRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BirdIdentifier",
                table: "FeedWaterRecords",
                type: "TEXT",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Comments",
                table: "FeedWaterRecords",
                type: "TEXT",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Medicine",
                table: "FeedWaterRecords",
                type: "TEXT",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Actions",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "BirdIdentifier",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "Symptoms",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "Temperature",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "UpdateMarking",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "VetPrescriptions",
                table: "WeighingRecords");

            migrationBuilder.DropColumn(
                name: "BirdIdentifier",
                table: "MortalityRecords");

            migrationBuilder.DropColumn(
                name: "Circumstances",
                table: "MortalityRecords");

            migrationBuilder.DropColumn(
                name: "VetComment",
                table: "MortalityRecords");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "MarkingRecords");

            migrationBuilder.DropColumn(
                name: "BirdIdentifier",
                table: "FeedWaterRecords");

            migrationBuilder.DropColumn(
                name: "Comments",
                table: "FeedWaterRecords");

            migrationBuilder.DropColumn(
                name: "Medicine",
                table: "FeedWaterRecords");
        }
    }
}
