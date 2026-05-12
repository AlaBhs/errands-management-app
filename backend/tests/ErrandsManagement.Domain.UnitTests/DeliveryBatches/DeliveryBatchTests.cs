using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Entities;
using ErrandsManagement.Domain.Enums;
using Xunit;

namespace ErrandsManagement.Domain.UnitTests.DeliveryBatches;

public sealed class DeliveryBatchTests
{
    private static readonly Guid AdminId = Guid.NewGuid();
    private static readonly Guid ReceptionId = Guid.NewGuid();

    private static DeliveryBatch CreateBatch() =>
        new("Report Q1", "Acme Corp", AdminId, "+21600000000");

    // ── Creation ────────────────────────────────────────────
    [Fact]
    public void Constructor_WithValidArgs_SetsCreatedStatus()
    {
        var batch = CreateBatch();
        Assert.Equal(DeliveryBatchStatus.Created, batch.Status);
    }

    [Fact]
    public void Constructor_EmptyTitle_Throws()
    {
        Assert.Throws<BusinessRuleException>(() =>
            new DeliveryBatch("", "Acme", AdminId));
    }

    [Fact]
    public void Constructor_EmptyClientName_Throws()
    {
        Assert.Throws<BusinessRuleException>(() =>
            new DeliveryBatch("Report Q1", "", AdminId));
    }

    // ── Handover ─────────────────────────────────────────────
    [Fact]
    public void MarkAsHandedToReception_FromCreated_Succeeds()
    {
        var batch = CreateBatch();
        batch.MarkAsHandedToReception(AdminId);
        Assert.Equal(DeliveryBatchStatus.HandedToReception, batch.Status);
        Assert.NotNull(batch.HandedToReceptionAt);
        Assert.Equal(AdminId, batch.HandedToReceptionBy);
    }

    [Fact]
    public void MarkAsHandedToReception_Twice_Throws()
    {
        var batch = CreateBatch();
        batch.MarkAsHandedToReception(AdminId);
        Assert.Throws<InvalidRequestStateException>(() =>
            batch.MarkAsHandedToReception(AdminId));
    }

    // ── Pickup ───────────────────────────────────────────────
    [Fact]
    public void ConfirmPickup_BeforeHandover_Throws()
    {
        var batch = CreateBatch();
        Assert.Throws<InvalidRequestStateException>(() =>
            batch.ConfirmPickup(ReceptionId, "John Doe"));
    }

    [Fact]
    public void ConfirmPickup_AfterHandover_Succeeds()
    {
        var batch = CreateBatch();
        batch.MarkAsHandedToReception(AdminId);
        batch.ConfirmPickup(ReceptionId, "John Doe");
        Assert.Equal(DeliveryBatchStatus.PickedUp, batch.Status);
        Assert.Equal("John Doe", batch.PickedUpBy);
        Assert.Equal(ReceptionId, batch.ConfirmedBy);
    }

    // ── Cancel ───────────────────────────────────────────────
    [Fact]
    public void Cancel_AfterPickup_Throws()
    {
        var batch = CreateBatch();
        batch.MarkAsHandedToReception(AdminId);
        batch.ConfirmPickup(ReceptionId);
        Assert.Throws<InvalidRequestStateException>(() =>
            batch.Cancel(ReceptionId, "Too late"));
    }

    [Fact]
    public void Cancel_FromHandedToReception_Succeeds()
    {
        var batch = CreateBatch();
        batch.MarkAsHandedToReception(AdminId);
        batch.Cancel(ReceptionId, "Client no-show");
        Assert.Equal(DeliveryBatchStatus.Cancelled, batch.Status);
        Assert.Equal("Client no-show", batch.CancelReason);
    }

    [Fact]
    public void Cancel_Twice_Throws()
    {
        var batch = CreateBatch();
        batch.Cancel(AdminId);
        Assert.Throws<InvalidRequestStateException>(() =>
            batch.Cancel(AdminId));
    }
}