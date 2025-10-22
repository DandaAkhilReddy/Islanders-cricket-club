import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { logger } from './logger';

export interface UserRole {
  isAdmin: boolean;
  isScorer: boolean;
  isPlayer: boolean;
}

export interface UserData extends UserRole {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
}

// Admin email addresses
const ADMIN_EMAILS = ['akhilreddydanda3@gmail.com'];

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<UserData | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return null;
    }
    
    return userSnap.data() as UserData;
  } catch (error) {
    logger.error('Error getting user data', error, 'USER_SERVICE');
    throw error;
  }
}

/**
 * Create or update user document in Firestore
 */
export async function createOrUpdateUser(
  firebaseUser: FirebaseUser
): Promise<UserData> {
  try {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);

    const existingData = userSnap.exists()
      ? (userSnap.data() as Partial<UserData>)
      : null;
    const defaultIsAdmin = ADMIN_EMAILS.includes(firebaseUser.email || '');

    const roles: UserRole = {
      isAdmin: existingData?.isAdmin ?? defaultIsAdmin,
      isScorer: existingData?.isScorer ?? defaultIsAdmin,
      isPlayer: existingData?.isPlayer ?? !defaultIsAdmin,
    };

    const userData: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      ...roles,
      createdAt: userSnap.exists() 
        ? userSnap.data().createdAt 
        : Timestamp.now(),
      lastLoginAt: Timestamp.now(),
    };

    if (!userSnap.exists()) {
      // Create new user
      await setDoc(userRef, userData);
    } else {
      // Update existing user
      await updateDoc(userRef, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
        lastLoginAt: serverTimestamp(),
        ...roles,
      });
    }
    
    return userData;
  } catch (error) {
    logger.error('Error creating/updating user', error, 'USER_SERVICE');
    throw error;
  }
}

/**
 * Update user roles
 */
export async function updateUserRoles(
  uid: string,
  roles: Partial<UserRole>
): Promise<void> {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, roles);
  } catch (error) {
    logger.error('Error updating user roles', error, 'USER_SERVICE');
    throw error;
  }
}
