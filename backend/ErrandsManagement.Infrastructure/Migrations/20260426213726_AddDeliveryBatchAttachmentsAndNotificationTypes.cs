using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ErrandsManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddDeliveryBatchAttachmentsAndNotificationTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DeliveryBatchId",
                table: "Attachment",
                type: "uniqueidentifier",
                nullable: true);

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

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Attachment_DeliveryBatches_DeliveryBatchId",
                table: "Attachment");

            migrationBuilder.DropIndex(
                name: "IX_Attachment_DeliveryBatchId",
                table: "Attachment");

            migrationBuilder.DropColumn(
                name: "DeliveryBatchId",
                table: "Attachment");
        }
    }
}
