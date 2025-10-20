import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createOrUpdateUser } from '../services/userService';
import type { UserData } from '../services/userService';
import { getPlayerByAuthId } from '../services/playerClaimService';

interface UserDataWithRoles extends UserData {
  isAdmin: boolean;
  isScorer: boolean;
  isPlayer: boolean;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserDataWithRoles | null;
  loading: boolean;
  isAdmin: boolean;
  isScorer: boolean;
  isPlayer: boolean;
  hasClaimedProfile: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserDataWithRoles | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasClaimedProfile, setHasClaimedProfile] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          const data = await createOrUpdateUser(user);
          setUserData(data as UserDataWithRoles);

          // Check if player profile is claimed (only for non-admin players)
          if (!data.isAdmin && !data.isScorer) {
            const playerProfile = await getPlayerByAuthId(user.uid);
            setHasClaimedProfile(!!playerProfile);
          } else {
            // Admins and scorers don't need to claim profiles
            setHasClaimedProfile(true);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserData(null);
          setHasClaimedProfile(false);
        }
      } else {
        setUserData(null);
        setHasClaimedProfile(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setHasClaimedProfile(false);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    isAdmin: userData?.isAdmin || false,
    isScorer: userData?.isScorer || false,
    isPlayer: userData?.isPlayer || false,
    hasClaimedProfile,
    signInWithGoogle,
    signOut,
    logout: signOut, // Alias for consistency
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
