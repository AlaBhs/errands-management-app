export interface RequestMessageDto {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;       
}

export interface SendMessagePayload {
  content: string;
}