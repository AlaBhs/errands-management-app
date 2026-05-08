using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOperationalReports : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OperationalReports",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    GeneratedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodFrom = table.Column<DateTime>(type: "datetime2", nullable: false),
                    PeriodTo = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MetricsSnapshot = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AiAnalysis = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AiUnavailable = table.Column<bool>(type: "bit", nullable: false),
                    GeneratedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OperationalReports", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OperationalReports_GeneratedAt",
                table: "OperationalReports",
                column: "GeneratedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "OperationalReports");
        }
    }
}
