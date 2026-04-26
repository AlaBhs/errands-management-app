export const NotificationType = {
  RequestCreated   :  1,
  RequestAssigned  :  2,
  RequestStarted   :  3,
  RequestCompleted :  4,
  RequestCancelled :  5,
  NewMessageReceived: 6,

  DeliveryHandedToReception: 10,
  DeliveryPickedUp:          11,

  General          :  99,
}

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];