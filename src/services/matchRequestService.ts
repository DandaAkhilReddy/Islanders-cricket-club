import {
  collection,
  doc,
  addDoc,
  updateDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { MatchRequest, MatchRequestInput, ReviewerInfo } from '../types/requests';

const COLLECTION_NAME = 'matchRequests';

export async function submitMatchRequest(
  requesterId: string,
  requesterName: string,
  requesterEmail: string | null | undefined,
  input: MatchRequestInput
): Promise<string> {
  const requestData = {
    requesterId,
    requesterName,
    requesterEmail: requesterEmail || null,
    opponent: input.opponent,
    proposedDate: Timestamp.fromDate(input.proposedDate),
    venue: input.venue,
    matchType: input.matchType,
    opponentScoutingNotes: input.opponentScoutingNotes || '',
    screenshots: input.screenshots || [],
    notes: input.notes || '',
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), requestData);
  return docRef.id;
}

export async function fetchMatchRequests(userId?: string): Promise<MatchRequest[]> {
  let q;
  if (userId) {
    q = query(
      collection(db, COLLECTION_NAME),
      where('requesterId', '==', userId),
      orderBy('createdAt', 'desc')
    );
  } else {
    q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
  }

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<MatchRequest, 'id'>),
  }));
}

export async function fetchPendingMatchRequests(): Promise<MatchRequest[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<MatchRequest, 'id'>),
  }));
}

export async function updateMatchRequestStatus(
  requestId: string,
  status: 'approved' | 'rejected',
  reviewer: ReviewerInfo,
  reviewNotes?: string
): Promise<void> {
  const requestRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(requestRef, {
    status,
    reviewedBy: reviewer.uid,
    reviewedByEmail: reviewer.email || null,
    reviewedByName: reviewer.name || null,
    reviewNotes: reviewNotes || null,
    reviewedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
