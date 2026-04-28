export const NotificationType = {
  RequestCreated: "RequestCreated",
  RequestAssigned: "RequestAssigned",
  RequestStarted: "RequestStarted",
  RequestCompleted: "RequestCompleted",
  RequestCancelled: "RequestCancelled",
  NewMessageReceived: "NewMessageReceived",

  DeliveryHandedToReception: "DeliveryHandedToReception",
  DeliveryPickedUp: "DeliveryPickedUp",

  General: "General",
};

export type NotificationType =
  (typeof NotificationType)[keyof typeof NotificationType];
