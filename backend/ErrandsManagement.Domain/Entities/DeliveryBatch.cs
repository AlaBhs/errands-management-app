using ErrandsManagement.Domain.Common;
using ErrandsManagement.Domain.Common.Exceptions;
using ErrandsManagement.Domain.Enums;
using ErrandsManagement.Domain.Events;

namespace ErrandsManagement.Domain.Entities;

public sealed class DeliveryBatch : BaseEntity
{
    // Identity
    public string Title { get; private set; }

    // Client info
    public string ClientName { get; private set; }
    public string? ClientPhone { get; private set; }
    public string? PickupNote { get; private set; }

    // Status
    public DeliveryBatchStatus Status { get; private set; }

    // Audit timeline
    public Guid CreatedBy { get; private set; }

    public DateTime? HandedToReceptionAt { get; private set; }
    public Guid? HandedToReceptionBy { get; private set; }

    public DateTime? PickedUpAt { get; private set; }
    public string? PickedUpBy { get; private set; }   // free-text client name
    public Guid? ConfirmedBy { get; private set; }    // reception user id

    public DateTime? CancelledAt { get; private set; }
    public string? CancelReason { get; private set; }

#pragma warning disable CS8618
    private DeliveryBatch() { }   // EF Core
#pragma warning restore CS8618

    public DeliveryBatch(
        string title,
        string clientName,
        Guid createdBy,
        string? clientPhone = null,
        string? pickupNote = null)
    {
        if (string.IsNullOrWhiteSpace(title))
            throw new BusinessRuleException("Title is required.");

        if (string.IsNullOrWhiteSpace(clientName))
            throw new BusinessRuleException("ClientName is required.");

        Title = title;
        ClientName = clientName;
        ClientPhone = clientPhone;
        PickupNote = pickupNote;
        CreatedBy = createdBy;
        Status = DeliveryBatchStatus.Created;

        RaiseDomainEvent(new DeliveryBatchCreatedEvent(Id));
    }

    // ── Step 2 ──────────────────────────────────────────────
    public void MarkAsHandedToReception(Guid byUserId)
    {
        if (Status != DeliveryBatchStatus.Created)
            throw new InvalidRequestStateException(
                "Batch can only be handed to reception from Created status.");

        Status = DeliveryBatchStatus.HandedToReception;
        HandedToReceptionAt = DateTime.UtcNow;
        HandedToReceptionBy = byUserId;

        MarkAsUpdated();
        RaiseDomainEvent(new DeliveryBatchHandedToReceptionEvent(Id));
    }

    // ── Step 3A ─────────────────────────────────────────────
    public void ConfirmPickup(Guid confirmedByUserId, string? pickedUpBy = null)
    {
        if (Status != DeliveryBatchStatus.HandedToReception)
            throw new InvalidRequestStateException(
                "Batch must be handed to reception before it can be picked up.");

        Status = DeliveryBatchStatus.PickedUp;
        PickedUpAt = DateTime.UtcNow;
        PickedUpBy = pickedUpBy;
        ConfirmedBy = confirmedByUserId;

        MarkAsUpdated();
        RaiseDomainEvent(new DeliveryBatchPickedUpEvent(Id));
    }

    // ── Step 3B ─────────────────────────────────────────────
    public void Cancel(Guid cancelledByUserId, string? reason = null)
    {
        if (Status == DeliveryBatchStatus.PickedUp)
            throw new InvalidRequestStateException(
                "Cannot cancel a batch that has already been picked up.");

        if (Status == DeliveryBatchStatus.Cancelled)
            throw new InvalidRequestStateException("Batch is already cancelled.");

        Status = DeliveryBatchStatus.Cancelled;
        CancelledAt = DateTime.UtcNow;
        CancelReason = reason;

        MarkAsUpdated();
        RaiseDomainEvent(new DeliveryBatchCancelledEvent(Id, reason));
    }
}