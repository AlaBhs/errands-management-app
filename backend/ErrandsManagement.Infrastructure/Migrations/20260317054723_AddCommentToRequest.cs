using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCommentToRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "Comment",
                table: "Requests",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Comment",
                table: "Requests");
        }
    }
}
