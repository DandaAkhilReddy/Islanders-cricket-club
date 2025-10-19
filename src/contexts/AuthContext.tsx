import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { createOrUpdateUser, getUserData, type UserRole } from '../services/userService';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: UserDataWithRoles | null;
  loading: boolean;
  isAdmin: boolean;
  isScorer: boolean;
  isPlayer: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface UserDataWithRoles {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  roles: UserRole;
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Create or update user in Firestore
          const data = await createOrUpdateUser(user);
          setUserData(data);
        } catch (error) {
          console.error('Error loading user data:', error);
          setUserData(null);
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function signInWithGoogle() {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // User data will be loaded by onAuthStateChanged listener
      const data = await createOrUpdateUser(result.user);
      setUserData(data);
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
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  const value: AuthContextType = {
    currentUser,
    userData,
    loading,
    isAdmin: userData?.roles?.isAdmin || false,
    isScorer: userData?.roles?.isScorer || false,
    isPlayer: userData?.roles?.isPlayer || false,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
