import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { logFirebaseConfigValidation } from './firebaseConfigValidator';

const sanitize = (value: string | undefined) =>
  value
    ?.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\+/g, '')
    .replace(/\s+/g, '')
    .replace(/=+$/g, '');

const firebaseConfig = {
  apiKey: sanitize(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  projectId: sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID),
  storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
  databaseURL: sanitize(import.meta.env.VITE_FIREBASE_DATABASE_URL),
  measurementId: sanitize(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
};

// Validate Firebase configuration before initializing
logFirebaseConfigValidation();

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
