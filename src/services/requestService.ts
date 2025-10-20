import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface PlayerUpdateChanges {
  profile: Record<string, unknown>;
  previousProfile: Record<string, unknown>;
  equipment: Record<string, unknown>;
  previousEquipment: Record<string, unknown>;
}

export interface PlayerUpdateRequestPayload {
  playerId: string;
  playerName: string;
  playerEmail?: string | null;
  requestedByUid: string;
  requestedByName?: string | null;
  requestedByEmail?: string | null;
  changes: PlayerUpdateChanges;
  screenshots: string[];
  notes?: string;
}

export interface PlayerUpdateRequestDoc extends PlayerUpdateRequestPayload {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Timestamp;
  reviewedBy?: string;
  reviewedByEmail?: string | null;
  reviewedByName?: string | null;
  reviewedAt?: Timestamp | null;
  reviewNotes?: string;
}

const COLLECTION_NAME = 'playerUpdateRequests';

export async function submitPlayerUpdateRequest(payload: PlayerUpdateRequestPayload) {
  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...payload,
    status: 'pending' as const,
    adminEmail: 'akhilreddydanda3@gmail.com',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef;
}

export async function fetchPlayerUpdateRequests(playerId: string) {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('playerId', '==', playerId),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<PlayerUpdateRequestDoc, 'id'>),
  }));
}

export async function fetchPendingPlayerUpdateRequests() {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<PlayerUpdateRequestDoc, 'id'>),
  }));
}

export async function fetchAllPlayerUpdateRequests() {
  const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<PlayerUpdateRequestDoc, 'id'>),
  }));
}

export async function updatePlayerRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewer: { uid: string; email?: string | null; name?: string | null },
  reviewNotes?: string
) {
  const requestRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(requestRef, {
    status,
    reviewedBy: reviewer.uid,
    reviewedByEmail: reviewer.email ?? null,
    reviewedByName: reviewer.name ?? null,
    reviewNotes: reviewNotes ?? null,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function markRequestUpdated(requestId: string) {
  const requestRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(requestRef, {
    updatedAt: serverTimestamp(),
  });
}
