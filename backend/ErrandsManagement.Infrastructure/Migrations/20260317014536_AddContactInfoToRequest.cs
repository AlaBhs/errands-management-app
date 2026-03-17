using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddContactInfoToRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ContactPerson",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ContactPhone",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ContactPerson",
                table: "Requests");

            migrationBuilder.DropColumn(
                name: "ContactPhone",
                table: "Requests");
        }
    }
}
