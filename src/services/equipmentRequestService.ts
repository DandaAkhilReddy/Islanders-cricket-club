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
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { EquipmentRequest, EquipmentRequestInput, ReviewerInfo } from '../types/requests';

const COLLECTION_NAME = 'equipmentRequests';

export async function submitEquipmentRequest(
  requesterId: string,
  requesterName: string,
  requesterEmail: string | null | undefined,
  input: EquipmentRequestInput
): Promise<string> {
  const requestData = {
    requesterId,
    requesterName,
    requesterEmail: requesterEmail || null,
    itemType: input.itemType,
    itemName: input.itemName,
    quantity: input.quantity,
    size: input.size || '',
    urgency: input.urgency,
    reason: input.reason || '',
    estimatedCost: input.estimatedCost || 0,
    notes: input.notes || '',
    fulfilled: false,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), requestData);
  return docRef.id;
}

export async function fetchEquipmentRequests(userId?: string): Promise<EquipmentRequest[]> {
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
    ...(doc.data() as Omit<EquipmentRequest, 'id'>),
  }));
}

export async function fetchPendingEquipmentRequests(): Promise<EquipmentRequest[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<EquipmentRequest, 'id'>),
  }));
}

export async function updateEquipmentRequestStatus(
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

export async function markEquipmentRequestFulfilled(requestId: string): Promise<void> {
  const requestRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(requestRef, {
    fulfilled: true,
    fulfilledAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
