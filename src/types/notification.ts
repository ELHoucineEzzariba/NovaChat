export type NotificationType = "mention" | "reaction" | "dm";

export interface AppNotification {
  id: string;
  type: NotificationType;
  fromUserId: string;
  conversationCollection: "channels" | "directMessages";
  conversationId: string;
  messageId: string;
  preview: string;
  createdAt: number;
  read: boolean;
}
