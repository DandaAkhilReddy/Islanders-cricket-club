import { Timestamp } from 'firebase/firestore';

export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface BaseRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail?: string | null;
  status: RequestStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  reviewedBy?: string;
  reviewedByName?: string | null;
  reviewedByEmail?: string | null;
  reviewedAt?: Timestamp | null;
  reviewNotes?: string;
  notes?: string; // requester's notes
}

// Match Request Types
export interface MatchRequest extends BaseRequest {
  opponent: string;
  proposedDate: Timestamp;
  venue: string;
  matchType: 'T20' | 'T10' | 'ODI' | 'Practice';
  opponentScoutingNotes?: string;
  screenshots?: string[]; // opponent scouting images
}

export interface MatchRequestInput {
  opponent: string;
  proposedDate: Date;
  venue: string;
  matchType: 'T20' | 'T10' | 'ODI' | 'Practice';
  opponentScoutingNotes?: string;
  screenshots?: string[];
  notes?: string;
}

// Practice Request Types
export interface PracticeRequest extends BaseRequest {
  proposedDate: Timestamp;
  duration: number; // in minutes
  focusAreas: string[]; // e.g., ['Batting', 'Bowling', 'Fielding']
  venue?: string;
  equipmentNeeded?: string[];
}

export interface PracticeRequestInput {
  proposedDate: Date;
  duration: number;
  focusAreas: string[];
  venue?: string;
  equipmentNeeded?: string[];
  notes?: string;
}

// Equipment Request Types
export interface EquipmentRequest extends BaseRequest {
  itemType: 'Bat' | 'Pads' | 'Gloves' | 'Helmet' | 'Jersey' | 'Cap' | 'Shoes' | 'Other';
  itemName: string;
  quantity: number;
  size?: string;
  urgency: 'Low' | 'Medium' | 'High';
  reason?: string;
  estimatedCost?: number;
  fulfilled?: boolean;
  fulfilledAt?: Timestamp;
}

export interface EquipmentRequestInput {
  itemType: 'Bat' | 'Pads' | 'Gloves' | 'Helmet' | 'Jersey' | 'Cap' | 'Shoes' | 'Other';
  itemName: string;
  quantity: number;
  size?: string;
  urgency: 'Low' | 'Medium' | 'High';
  reason?: string;
  estimatedCost?: number;
  notes?: string;
}

// Expense Request Types
export interface ExpenseRequest extends BaseRequest {
  category: 'Travel' | 'Equipment' | 'Match Fee' | 'Food' | 'Other';
  amount: number;
  description: string;
  expenseDate: Timestamp;
  receipts: string[]; // image URLs
  reimbursed?: boolean;
  reimbursedAt?: Timestamp;
  transactionId?: string;
}

export interface ExpenseRequestInput {
  category: 'Travel' | 'Equipment' | 'Match Fee' | 'Food' | 'Other';
  amount: number;
  description: string;
  expenseDate: Date;
  receipts: string[];
  notes?: string;
}

// Union type for all requests
export type AnyRequest = MatchRequest | PracticeRequest | EquipmentRequest | ExpenseRequest;

export interface ReviewerInfo {
  uid: string;
  email?: string | null;
  name?: string | null;
}
