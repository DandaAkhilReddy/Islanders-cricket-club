import {
  collection,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  query,
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface ClaimablePlayer {
  id: string;
  name: string;
  role: string;
  position: string;
  email?: string;
  isClaimed: boolean;
  claimedBy?: string;
  claimedByEmail?: string;
  claimedAt?: Timestamp;
}

/**
 * Get all unclaimed player profiles
 */
export async function getUnclaimedPlayers(): Promise<ClaimablePlayer[]> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('isClaimed', '==', false));
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      role: doc.data().role,
      position: doc.data().position,
      email: doc.data().email,
      isClaimed: doc.data().isClaimed || false,
      claimedBy: doc.data().claimedBy,
      claimedByEmail: doc.data().claimedByEmail,
      claimedAt: doc.data().claimedAt,
    }));
  } catch (error) {
    console.error('Error fetching unclaimed players:', error);
    // If collection doesn't exist yet, return empty array
    return [];
  }
}

/**
 * Get all players (for displaying full roster)
 */
export async function getAllPlayers(): Promise<ClaimablePlayer[]> {
  try {
    const playersRef = collection(db, 'players');
    const snapshot = await getDocs(playersRef);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
      role: doc.data().role,
      position: doc.data().position,
      email: doc.data().email,
      isClaimed: doc.data().isClaimed || false,
      claimedBy: doc.data().claimedBy,
      claimedByEmail: doc.data().claimedByEmail,
      claimedAt: doc.data().claimedAt,
    }));
  } catch (error) {
    console.error('Error fetching all players:', error);
    return [];
  }
}

/**
 * Claim a player profile
 */
export async function claimPlayerProfile(
  playerId: string,
  authUid: string,
  email: string,
  displayName: string
): Promise<void> {
  try {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
      throw new Error('Player profile not found');
    }

    const playerData = playerSnap.data();

    // Check if already claimed
    if (playerData.isClaimed) {
      throw new Error('This profile has already been claimed by another user');
    }

    // Update player profile with claim information
    await updateDoc(playerRef, {
      isClaimed: true,
      claimedBy: authUid,
      claimedByEmail: email,
      claimedByName: displayName,
      claimedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error claiming player profile:', error);
    throw error;
  }
}

/**
 * Get player profile by auth UID
 */
export async function getPlayerByAuthId(authUid: string): Promise<ClaimablePlayer | null> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('claimedBy', '==', authUid));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      name: doc.data().name,
      role: doc.data().role,
      position: doc.data().position,
      email: doc.data().email,
      isClaimed: doc.data().isClaimed || false,
      claimedBy: doc.data().claimedBy,
      claimedByEmail: doc.data().claimedByEmail,
      claimedAt: doc.data().claimedAt,
    };
  } catch (error) {
    console.error('Error getting player by auth ID:', error);
    return null;
  }
}

/**
 * Check if a profile is already claimed
 */
export async function isProfileClaimed(playerId: string): Promise<boolean> {
  try {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);

    if (!playerSnap.exists()) {
      return false;
    }

    return playerSnap.data().isClaimed || false;
  } catch (error) {
    console.error('Error checking if profile is claimed:', error);
    return false;
  }
}

/**
 * Find player profile by email (for auto-matching)
 */
export async function findPlayerByEmail(email: string): Promise<ClaimablePlayer | null> {
  try {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, where('email', '==', email), where('isClaimed', '==', false));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      name: doc.data().name,
      role: doc.data().role,
      position: doc.data().position,
      email: doc.data().email,
      isClaimed: doc.data().isClaimed || false,
      claimedBy: doc.data().claimedBy,
      claimedByEmail: doc.data().claimedByEmail,
      claimedAt: doc.data().claimedAt,
    };
  } catch (error) {
    console.error('Error finding player by email:', error);
    return null;
  }
}

/**
 * Unclaim a profile (admin only - for testing or corrections)
 */
export async function unclaimPlayerProfile(playerId: string): Promise<void> {
  try {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, {
      isClaimed: false,
      claimedBy: null,
      claimedByEmail: null,
      claimedByName: null,
      claimedAt: null,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unclaiming player profile:', error);
    throw error;
  }
}
