import { Timestamp } from 'firebase/firestore';

export type ConversationType = 'direct' | 'group' | 'team';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderPhotoURL?: string | null;
  text: string;
  attachments?: string[];
  timestamp: Timestamp;
  readBy: string[];
  reactions?: Record<string, string[]>; // emoji -> array of user IDs
  edited?: boolean;
  editedAt?: Timestamp;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  participants: string[]; // array of user IDs
  participantNames: Record<string, string>; // uid -> name mapping
  participantPhotos: Record<string, string | null>; // uid -> photoURL mapping
  name?: string; // for group chats
  description?: string; // for group chats
  photoURL?: string; // for group chats
  createdBy: string;
  createdAt: Timestamp;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    timestamp: Timestamp;
  };
  updatedAt: Timestamp;
  unreadCount?: Record<string, number>; // uid -> unread count
  typing?: string[]; // array of user IDs currently typing
}

export interface MessageInput {
  text: string;
  attachments?: string[];
}

export interface ConversationInput {
  type: ConversationType;
  participants: string[];
  name?: string;
  description?: string;
}
