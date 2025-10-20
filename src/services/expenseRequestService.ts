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
import type { ExpenseRequest, ExpenseRequestInput, ReviewerInfo } from '../types/requests';

const COLLECTION_NAME = 'expenseRequests';

export async function submitExpenseRequest(
  requesterId: string,
  requesterName: string,
  requesterEmail: string | null | undefined,
  input: ExpenseRequestInput
): Promise<string> {
  const requestData = {
    requesterId,
    requesterName,
    requesterEmail: requesterEmail || null,
    category: input.category,
    amount: input.amount,
    description: input.description,
    expenseDate: Timestamp.fromDate(input.expenseDate),
    receipts: input.receipts,
    notes: input.notes || '',
    reimbursed: false,
    status: 'pending' as const,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), requestData);
  return docRef.id;
}

export async function fetchExpenseRequests(userId?: string): Promise<ExpenseRequest[]> {
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
    ...(doc.data() as Omit<ExpenseRequest, 'id'>),
  }));
}

export async function fetchPendingExpenseRequests(): Promise<ExpenseRequest[]> {
  const q = query(
    collection(db, COLLECTION_NAME),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as Omit<ExpenseRequest, 'id'>),
  }));
}

export async function updateExpenseRequestStatus(
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

export async function markExpenseRequestReimbursed(
  requestId: string,
  transactionId?: string
): Promise<void> {
  const requestRef = doc(db, COLLECTION_NAME, requestId);
  await updateDoc(requestRef, {
    reimbursed: true,
    reimbursedAt: serverTimestamp(),
    transactionId: transactionId || '',
    updatedAt: serverTimestamp(),
  });
}
