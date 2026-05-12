export interface CreateDeliveryBatchPayload {
  title:       string;
  clientName:  string;
  clientPhone?: string;
  pickupNote?:  string;
}

export interface ConfirmPickupPayload {
  pickedUpBy?: string;
}

export interface CancelDeliveryBatchPayload {
  reason?: string;
}