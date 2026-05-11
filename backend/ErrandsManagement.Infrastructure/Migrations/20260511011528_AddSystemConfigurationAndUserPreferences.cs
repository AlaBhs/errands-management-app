using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemConfigurationAndUserPreferences : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ConfigurationChangeLogs",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ChangedByUserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Section = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PreviousValueJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NewValueJson = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ConfigurationChangeLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemConfigurations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    RecommendationPolicy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SlaPolicy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ExpensePolicy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NotificationPolicy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    RequestPolicy = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemConfigurations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "UserPreferences",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Language = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    Theme = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DefaultView = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    DisabledNotificationTypes = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CollaboratorDefaults = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CourierDefaults = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserPreferences", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ConfigurationChangeLogs_ChangedAt",
                table: "ConfigurationChangeLogs",
                column: "ChangedAt");

            migrationBuilder.CreateIndex(
                name: "IX_ConfigurationChangeLogs_Section",
                table: "ConfigurationChangeLogs",
                column: "Section");

            migrationBuilder.CreateIndex(
                name: "IX_UserPreferences_UserId",
                table: "UserPreferences",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ConfigurationChangeLogs");

            migrationBuilder.DropTable(
                name: "SystemConfigurations");

            migrationBuilder.DropTable(
                name: "UserPreferences");
        }
    }
}
