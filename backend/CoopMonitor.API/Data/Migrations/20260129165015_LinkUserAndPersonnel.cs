using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CoopMonitor.API.Data.Migrations
{
    /// <inheritdoc />
    public partial class LinkUserAndPersonnel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DiseaseRecords_Personnel_PersonnelId",
                table: "DiseaseRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_FeedWaterRecords_Personnel_PersonnelId",
                table: "FeedWaterRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_MarkingRecords_Personnel_PersonnelId",
                table: "MarkingRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_MortalityRecords_Personnel_PersonnelId",
                table: "MortalityRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_WeighingRecords_Personnel_PersonnelId",
                table: "WeighingRecords");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Personnel",
                table: "Personnel");

            migrationBuilder.RenameTable(
                name: "Personnel",
                newName: "Personnels");

            migrationBuilder.RenameIndex(
                name: "IX_Personnel_UserId",
                table: "Personnels",
                newName: "IX_Personnels_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Personnels",
                table: "Personnels",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DiseaseRecords_Personnels_PersonnelId",
                table: "DiseaseRecords",
                column: "PersonnelId",
                principalTable: "Personnels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedWaterRecords_Personnels_PersonnelId",
                table: "FeedWaterRecords",
                column: "PersonnelId",
                principalTable: "Personnels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MarkingRecords_Personnels_PersonnelId",
                table: "MarkingRecords",
                column: "PersonnelId",
                principalTable: "Personnels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MortalityRecords_Personnels_PersonnelId",
                table: "MortalityRecords",
                column: "PersonnelId",
                principalTable: "Personnels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Personnels_AspNetUsers_UserId",
                table: "Personnels",
                column: "UserId",
                principalTable: "AspNetUsers",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_WeighingRecords_Personnels_PersonnelId",
                table: "WeighingRecords",
                column: "PersonnelId",
                principalTable: "Personnels",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DiseaseRecords_Personnels_PersonnelId",
                table: "DiseaseRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_FeedWaterRecords_Personnels_PersonnelId",
                table: "FeedWaterRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_MarkingRecords_Personnels_PersonnelId",
                table: "MarkingRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_MortalityRecords_Personnels_PersonnelId",
                table: "MortalityRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_Personnels_AspNetUsers_UserId",
                table: "Personnels");

            migrationBuilder.DropForeignKey(
                name: "FK_WeighingRecords_Personnels_PersonnelId",
                table: "WeighingRecords");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Personnels",
                table: "Personnels");

            migrationBuilder.RenameTable(
                name: "Personnels",
                newName: "Personnel");

            migrationBuilder.RenameIndex(
                name: "IX_Personnels_UserId",
                table: "Personnel",
                newName: "IX_Personnel_UserId");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Personnel",
                table: "Personnel",
                column: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DiseaseRecords_Personnel_PersonnelId",
                table: "DiseaseRecords",
                column: "PersonnelId",
                principalTable: "Personnel",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_FeedWaterRecords_Personnel_PersonnelId",
                table: "FeedWaterRecords",
                column: "PersonnelId",
                principalTable: "Personnel",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MarkingRecords_Personnel_PersonnelId",
                table: "MarkingRecords",
                column: "PersonnelId",
                principalTable: "Personnel",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_MortalityRecords_Personnel_PersonnelId",
                table: "MortalityRecords",
                column: "PersonnelId",
                principalTable: "Personnel",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_WeighingRecords_Personnel_PersonnelId",
                table: "WeighingRecords",
                column: "PersonnelId",
                principalTable: "Personnel",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
