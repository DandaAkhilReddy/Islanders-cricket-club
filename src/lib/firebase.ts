import { initializeApp, getApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, GoogleAuthProvider, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { logFirebaseConfigValidation } from './firebaseConfigValidator';

const sanitize = (value: string | undefined) =>
  value
    ?.trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\+/g, '')
    .replace(/\s+/g, '');

const useEmulator = import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true';
const sanitizedProjectId = sanitize(import.meta.env.VITE_FIREBASE_PROJECT_ID) || 'islanders-demo';

const firebaseConfig: FirebaseOptions = useEmulator
  ? {
      apiKey: 'demo-api-key',
      authDomain: 'localhost',
      projectId: sanitizedProjectId,
      appId: 'demo-app-id',
      storageBucket: `${sanitizedProjectId}.appspot.com`,
      messagingSenderId: undefined,
      measurementId: undefined,
    }
  : {
      apiKey: sanitize(import.meta.env.VITE_FIREBASE_API_KEY),
      authDomain: sanitize(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
      projectId: sanitizedProjectId,
      appId: sanitize(import.meta.env.VITE_FIREBASE_APP_ID),
      storageBucket: sanitize(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
      messagingSenderId: sanitize(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
      databaseURL: sanitize(import.meta.env.VITE_FIREBASE_DATABASE_URL),
      measurementId: sanitize(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID),
    };

if (!useEmulator) {
  // Validate Firebase configuration before initializing
  logFirebaseConfigValidation();
} else {
  console.info('[firebase] Initializing in emulator mode.');
}

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

if (useEmulator) {
  const host = import.meta.env.VITE_FIREBASE_EMULATOR_HOST || '127.0.0.1';
  const firestorePort = Number(import.meta.env.VITE_FIREBASE_FIRESTORE_EMULATOR_PORT || 8080);
  const authPort = Number(import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_PORT || 9099);
  const storagePort = Number(import.meta.env.VITE_FIREBASE_STORAGE_EMULATOR_PORT || 9199);

  const globalScope = globalThis as Record<string, unknown>;
  if (!globalScope.__FIREBASE_EMULATORS_CONNECTED__) {
    connectAuthEmulator(auth, `http://${host}:${authPort}`, { disableWarnings: true });
    connectFirestoreEmulator(db, host, firestorePort);
    try {
      connectStorageEmulator(storage, host, storagePort);
    } catch (error) {
      console.warn('[firebase] Storage emulator connection failed. Continuing without storage emulator.', error);
    }
    globalScope.__FIREBASE_EMULATORS_CONNECTED__ = true;
  }
}

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
