export interface Reaction {
  emoji: string;
  userIds: string[];
}

export type AttachmentType = "image" | "gif" | "audio" | "file";

export interface Attachment {
  type: AttachmentType;
  url: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
  editedAt: number | null;
  reactions: Reaction[];
  threadReplyCount: number;
  mentionedUserIds: string[];
  attachment: Attachment | null;
}

export interface ThreadReply {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
  editedAt: number | null;
}

export interface DirectMessageConversation {
  id: string;
  participantIds: [string, string];
}
