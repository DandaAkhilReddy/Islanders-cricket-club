import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  arrayUnion,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Conversation, Message, MessageInput, ConversationInput } from '../types/message';

const CONVERSATIONS_COLLECTION = 'conversations';
const MESSAGES_COLLECTION = 'messages';

// Create a new conversation
export async function createConversation(
  input: ConversationInput,
  creatorId: string,
  creatorName: string,
  creatorPhoto?: string | null,
  participantData?: Record<string, { name: string; photo?: string | null }>
): Promise<string> {
  const participantNames: Record<string, string> = {};
  const participantPhotos: Record<string, string | null> = {};

  // Add creator
  participantNames[creatorId] = creatorName;
  participantPhotos[creatorId] = creatorPhoto || null;

  // Add other participants
  if (participantData) {
    Object.entries(participantData).forEach(([uid, data]) => {
      participantNames[uid] = data.name;
      participantPhotos[uid] = data.photo || null;
    });
  }

  const conversationData = {
    type: input.type,
    participants: [creatorId, ...input.participants.filter((p) => p !== creatorId)],
    participantNames,
    participantPhotos,
    name: input.name,
    description: input.description,
    createdBy: creatorId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadCount: {},
  };

  const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
  return docRef.id;
}

// Send a message in a conversation
export async function sendMessage(
  conversationId: string,
  senderId: string,
  senderName: string,
  senderPhotoURL: string | null | undefined,
  input: MessageInput
): Promise<string> {
  const messageData = {
    conversationId,
    senderId,
    senderName,
    senderPhotoURL: senderPhotoURL || null,
    text: input.text,
    attachments: input.attachments || [],
    timestamp: serverTimestamp(),
    readBy: [senderId],
    reactions: {},
  };

  const messagesRef = collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION);
  const docRef = await addDoc(messagesRef, messageData);

  // Update conversation with last message
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    lastMessage: {
      text: input.text,
      senderId,
      senderName,
      timestamp: serverTimestamp(),
    },
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

// Mark message as read
export async function markMessageAsRead(
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> {
  const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
  await updateDoc(messageRef, {
    readBy: arrayUnion(userId),
  });
}

// Mark all messages in conversation as read
export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  await updateDoc(conversationRef, {
    [`unreadCount.${userId}`]: 0,
  });
}

// Get user's conversations
export async function getUserConversations(userId: string): Promise<Conversation[]> {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<Conversation, 'id'>),
  }));
}

// Subscribe to user's conversations (real-time)
export function subscribeToUserConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participants', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Conversation, 'id'>),
    }));
    callback(conversations);
  });
}

// Get messages for a conversation
export async function getConversationMessages(
  conversationId: string,
  limitCount: number = 50
): Promise<Message[]> {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Message, 'id'>),
    }))
    .reverse(); // Reverse to get chronological order
}

// Subscribe to conversation messages (real-time)
export function subscribeToConversationMessages(
  conversationId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
): () => void {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<Message, 'id'>),
      }))
      .reverse();
    callback(messages);
  });
}

// Find or create direct conversation between two users
export async function findOrCreateDirectConversation(
  user1Id: string,
  user1Name: string,
  user1Photo: string | null | undefined,
  user2Id: string,
  user2Name: string,
  user2Photo: string | null | undefined
): Promise<string> {
  // Try to find existing conversation
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('type', '==', 'direct'),
    where('participants', 'array-contains', user1Id)
  );

  const snapshot = await getDocs(q);
  const existing = snapshot.docs.find((doc) => {
    const data = doc.data();
    return data.participants.includes(user2Id);
  });

  if (existing) {
    return existing.id;
  }

  // Create new conversation
  return createConversation(
    {
      type: 'direct',
      participants: [user2Id],
    },
    user1Id,
    user1Name,
    user1Photo,
    {
      [user2Id]: { name: user2Name, photo: user2Photo },
    }
  );
}

// Add reaction to message
export async function addReaction(
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
  await updateDoc(messageRef, {
    [`reactions.${emoji}`]: arrayUnion(userId),
  });
}

// Remove reaction from message
export async function removeReaction(
  conversationId: string,
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> {
  const messageRef = doc(db, CONVERSATIONS_COLLECTION, conversationId, MESSAGES_COLLECTION, messageId);
  const messageSnap = await getDoc(messageRef);
  const data = messageSnap.data();

  if (data?.reactions?.[emoji]) {
    const updated = data.reactions[emoji].filter((id: string) => id !== userId);
    await updateDoc(messageRef, {
      [`reactions.${emoji}`]: updated.length > 0 ? updated : null,
    });
  }
}

// Update typing indicator
export async function setTypingStatus(
  conversationId: string,
  userId: string,
  isTyping: boolean
): Promise<void> {
  const conversationRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
  const conversationSnap = await getDoc(conversationRef);
  const data = conversationSnap.data();

  const currentTyping = data?.typing || [];
  const updatedTyping = isTyping
    ? [...new Set([...currentTyping, userId])]
    : currentTyping.filter((id: string) => id !== userId);

  await updateDoc(conversationRef, {
    typing: updatedTyping,
  });
}

// Get team-wide conversation (create if doesn't exist)
export async function getTeamConversation(): Promise<string> {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('type', '==', 'team'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (!snapshot.empty) {
    return snapshot.docs[0].id;
  }

  // Create team conversation
  const conversationData = {
    type: 'team',
    participants: [], // All team members - populated dynamically
    participantNames: {},
    participantPhotos: {},
    name: 'Islanders Team Chat',
    description: 'Official team-wide communication channel',
    createdBy: 'system',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    unreadCount: {},
  };

  const docRef = await addDoc(collection(db, CONVERSATIONS_COLLECTION), conversationData);
  return docRef.id;
}
