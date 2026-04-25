using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddRequestTemplates : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "RequestTemplates",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Category = table.Column<int>(type: "int", nullable: false),
                    Address_Street = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Address_City = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address_PostalCode = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Address_Country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address_Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    Address_Latitude = table.Column<double>(type: "float", nullable: true),
                    Address_Longitude = table.Column<double>(type: "float", nullable: true),
                    EstimatedCost = table.Column<decimal>(type: "decimal(18,2)", precision: 18, scale: 2, nullable: true),
                    CreatedBy = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestTemplates", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_RequestTemplates_CreatedBy_Name",
                table: "RequestTemplates",
                columns: new[] { "CreatedBy", "Name" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "RequestTemplates");
        }
    }
}
