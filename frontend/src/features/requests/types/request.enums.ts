// --- Enums ---

export const RequestStatus = {
  Pending: 'Pending',
  Assigned: 'Assigned',
  InProgress: 'InProgress',
  Completed: 'Completed',
  Cancelled: 'Cancelled',
} as const;

export type RequestStatus = typeof RequestStatus[keyof typeof RequestStatus];

export const PriorityLevel = {
  Low: 'Low',
  Normal: 'Normal',
  High: 'High',
  Urgent: 'Urgent',
} as const;

export type PriorityLevel = typeof PriorityLevel[keyof typeof PriorityLevel];

export const RequestCategory = {
  OfficeSupplies: 'OfficeSupplies',
  ITEquipment:    'ITEquipment',
  Travel:         'Travel',
  Facilities:     'Facilities',
  Other:          'Other',
} as const;

export type RequestCategory = typeof RequestCategory[keyof typeof RequestCategory];

export const AttachmentType = {
  Document       : 'Document',
  DischargePhoto : 'DischargePhoto',
} as const;

export type AttachmentType = typeof AttachmentType[keyof typeof AttachmentType];