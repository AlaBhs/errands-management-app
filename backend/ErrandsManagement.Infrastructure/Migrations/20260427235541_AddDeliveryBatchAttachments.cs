using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryBatchAttachments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachment_DeliveryBatches_DeliveryBatchId",
                table: "Attachment");

            migrationBuilder.DropIndex(
                name: "IX_Attachment_DeliveryBatchId",
                table: "Attachment");

            migrationBuilder.CreateTable(
                name: "DeliveryBatchAttachments",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DeliveryBatchId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    FileName = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ContentType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Uri = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsDeleted = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DeliveryBatchAttachments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DeliveryBatchAttachments_DeliveryBatches_DeliveryBatchId",
                        column: x => x.DeliveryBatchId,
                        principalTable: "DeliveryBatches",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_DeliveryBatchAttachments_DeliveryBatchId",
                table: "DeliveryBatchAttachments",
                column: "DeliveryBatchId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "DeliveryBatchAttachments");

            migrationBuilder.CreateIndex(
                name: "IX_Attachment_DeliveryBatchId",
                table: "Attachment",
                column: "DeliveryBatchId");

            migrationBuilder.AddForeignKey(
                name: "FK_Attachment_DeliveryBatches_DeliveryBatchId",
                table: "Attachment",
                column: "DeliveryBatchId",
                principalTable: "DeliveryBatches",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
