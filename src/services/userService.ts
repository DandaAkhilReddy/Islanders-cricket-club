import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';

export interface UserRole {
  isAdmin: boolean;
  isScorer: boolean;
  isPlayer: boolean;
}

export interface UserData {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  roles: UserRole;
  createdAt: any;
  lastLogin: any;
}

// Admin emails - users with these emails automatically get admin role
const ADMIN_EMAILS = [
  'akhilreddydanda3@gmail.com',
];

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

/**
 * Create or update user in Firestore
 */
export async function createOrUpdateUser(firebaseUser: FirebaseUser): Promise<UserData> {
  const userRef = doc(db, 'users', firebaseUser.uid);

  // Check if user exists
  const existingUser = await getDoc(userRef);

  // Determine roles
  const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');

  const userData: UserData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    roles: {
      isAdmin,
      isScorer: existingUser.exists() ? existingUser.data().roles?.isScorer || false : false,
      isPlayer: true, // All users are players by default
    },
    createdAt: existingUser.exists() ? existingUser.data().createdAt : serverTimestamp(),
    lastLogin: serverTimestamp(),
  };

  await setDoc(userRef, userData, { merge: true });

  return userData;
}

/**
 * Update user roles (admin only)
 */
export async function updateUserRoles(uid: string, roles: Partial<UserRole>): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      throw new Error('User not found');
    }

    const currentRoles = userDoc.data().roles || {};
    const updatedRoles = { ...currentRoles, ...roles };

    await setDoc(userRef, { roles: updatedRoles }, { merge: true });
  } catch (error) {
    console.error('Error updating user roles:', error);
    throw error;
  }
}

/**
 * Check if email is an admin email
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email);
}
