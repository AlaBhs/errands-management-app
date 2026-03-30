export const NotificationType = {
  RequestCreated   :  1,
  RequestAssigned  :  2,
  RequestStarted   :  3,
  RequestCompleted :  4,
  RequestCancelled :  5,
  General          :  99,
}

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];