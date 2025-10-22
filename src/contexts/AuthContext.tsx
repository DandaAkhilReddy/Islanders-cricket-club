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
import { logger } from '../services/logger';

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

// Export hook separately to maintain Fast Refresh compatibility
function useAuth() {
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
    let mounted = true;

    // Initialize auth state listener
    const initializeAuth = async () => {
      // Set up the auth state listener
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!mounted) return;

        logger.debug('Auth state changed', {
          authenticated: !!user,
          uid: user?.uid,
          email: user?.email
        }, 'AUTH');

        setCurrentUser(user);

        if (user) {
          try {
            logger.debug('Loading user data...', undefined, 'AUTH');
            const data = await createOrUpdateUser(user);

            if (!mounted) return;

            setUserData(data as UserDataWithRoles);
            logger.debug('User data loaded', {
              isAdmin: data.isAdmin,
              isScorer: data.isScorer,
              isPlayer: data.isPlayer
            }, 'AUTH');

            // Check if player profile is claimed (only for non-admin players)
            if (!data.isAdmin && !data.isScorer) {
              logger.debug('Checking player profile claim status...', undefined, 'AUTH');
              const playerProfile = await getPlayerByAuthId(user.uid);

              if (!mounted) return;

              setHasClaimedProfile(!!playerProfile);
              logger.debug('Player profile claim status', {
                hasClaimedProfile: !!playerProfile
              }, 'AUTH');
            } else {
              // Admins and scorers don't need to claim profiles
              setHasClaimedProfile(true);
            }
          } catch (error) {
            if (!mounted) return;

            logger.error('Error loading user data', error, 'AUTH');
            setUserData(null);
            setHasClaimedProfile(false);
          }
        } else {
          setUserData(null);
          setHasClaimedProfile(false);
        }

        if (mounted) {
          setLoading(false);
          logger.debug('Auth loading complete', undefined, 'AUTH');
        }
      });

      return unsubscribe;
    };

    const unsubscribePromise = initializeAuth();

    return () => {
      mounted = false;
      unsubscribePromise.then(unsub => unsub?.());
    };
  }, []);

  async function signInWithGoogle() {
    try {
      logger.authEvent('Initiating Google sign-in popup');
      const result = await signInWithPopup(auth, googleProvider);
      logger.authEvent('Sign-in popup successful', {
        uid: result.user.uid,
        email: result.user.email
      });
      // Auth state change will be handled by onAuthStateChanged listener
    } catch (error: any) {
      logger.error('Google sign in error', error, 'AUTH');

      // Provide specific, user-friendly error messages
      const errorCode = error?.code || '';
      let userMessage = 'Failed to sign in with Google. Please try again.';

      switch (errorCode) {
        case 'auth/popup-blocked':
          userMessage = 'Sign-in popup was blocked by your browser. Please allow popups for this site and try again.';
          break;
        case 'auth/popup-closed-by-user':
          userMessage = 'Sign-in was cancelled. Please try again and complete the sign-in process.';
          break;
        case 'auth/unauthorized-domain':
          userMessage = 'This domain is not authorized for Google Sign-In. Please contact the administrator.';
          break;
        case 'auth/cancelled-popup-request':
          userMessage = 'Another sign-in is already in progress. Please wait and try again.';
          break;
        case 'auth/network-request-failed':
          userMessage = 'Network error. Please check your internet connection and try again.';
          break;
        case 'auth/internal-error':
          userMessage = 'Authentication service error. Please check that Firebase is properly configured.';
          break;
        case 'auth/invalid-api-key':
          userMessage = 'Invalid Firebase configuration. Please contact the administrator.';
          break;
        default:
          if (error?.message) {
            userMessage = error.message;
          }
      }

      const enhancedError = new Error(userMessage);
      (enhancedError as any).code = errorCode;
      (enhancedError as any).originalError = error;

      throw enhancedError;
    }
  }

  async function signOut() {
    try {
      logger.authEvent('User signing out', { uid: currentUser?.uid });
      await firebaseSignOut(auth);
      setCurrentUser(null);
      setUserData(null);
      setHasClaimedProfile(false);
      logger.authEvent('Sign out successful');
    } catch (error) {
      logger.error('Sign out error', error, 'AUTH');
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

// Export hook at the end for Fast Refresh compatibility
export { useAuth };
export { AuthContext };
