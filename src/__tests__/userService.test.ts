import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrUpdateUser } from '../services/userService';

const firebaseAppMock = vi.hoisted(() => ({
  initializeApp: vi.fn(() => ({})),
}));

vi.mock('firebase/app', () => firebaseAppMock);

const firebaseAuthMock = vi.hoisted(() => {
  const getAuth = vi.fn(() => ({}));
  class MockGoogleAuthProvider {
    setCustomParameters() {
      // noop
    }
  }
  return {
    getAuth,
    GoogleAuthProvider: MockGoogleAuthProvider,
  };
});

vi.mock('firebase/auth', () => firebaseAuthMock);

const firebaseStorageMock = vi.hoisted(() => ({
  getStorage: vi.fn(() => ({})),
}));

vi.mock('firebase/storage', () => firebaseStorageMock);

const firestoreMocks = vi.hoisted(() => {
  const setDoc = vi.fn();
  const updateDoc = vi.fn();
  const getDoc = vi.fn();
  const doc = vi.fn(() => ({ id: 'users/test' }));
  const serverTimestamp = vi.fn(() => 'server-timestamp');
  const timestampNowValue = { seconds: 0, nanoseconds: 0 };
  const timestampNow = vi.fn(() => timestampNowValue);
  const getFirestore = vi.fn(() => ({}));

  return {
    setDoc,
    updateDoc,
    getDoc,
    doc,
    serverTimestamp,
    timestampNow,
    timestampNowValue,
    getFirestore,
  };
});

vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => firestoreMocks.doc(...args),
  getDoc: (...args: unknown[]) => firestoreMocks.getDoc(...args),
  setDoc: (...args: unknown[]) => firestoreMocks.setDoc(...args),
  updateDoc: (...args: unknown[]) => firestoreMocks.updateDoc(...args),
  serverTimestamp: firestoreMocks.serverTimestamp,
  getFirestore: (...args: unknown[]) => firestoreMocks.getFirestore(...args),
  Timestamp: { now: firestoreMocks.timestampNow },
}));

const {
  setDoc: setDocMock,
  updateDoc: updateDocMock,
  getDoc: getDocMock,
  doc: docMock,
} = firestoreMocks;

const baseFirebaseUser = {
  uid: 'test-uid',
  email: 'user@example.com',
  displayName: 'Test User',
  photoURL: 'avatar.png',
} as any;

describe('createOrUpdateUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    docMock.mockReturnValue({ id: 'users/test' });
  });

  it('retains existing roles when a user document already exists', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        isAdmin: true,
        isScorer: false,
        isPlayer: true,
        createdAt: 'created-at',
      }),
    });

    const result = await createOrUpdateUser(baseFirebaseUser);

    expect(setDocMock).not.toHaveBeenCalled();
    expect(updateDocMock).toHaveBeenCalledTimes(1);
    const updatePayload = updateDocMock.mock.calls[0][1];
    expect(updatePayload).toMatchObject({
      displayName: baseFirebaseUser.displayName,
      photoURL: baseFirebaseUser.photoURL,
      isAdmin: true,
      isScorer: false,
      isPlayer: true,
    });

    expect(result.isAdmin).toBe(true);
    expect(result.isScorer).toBe(false);
    expect(result.isPlayer).toBe(true);
  });

  it('creates a new player with default player role when no document exists', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    });

    const result = await createOrUpdateUser(baseFirebaseUser);

    expect(setDocMock).toHaveBeenCalledTimes(1);
    const setPayload = setDocMock.mock.calls[0][1];
    expect(setPayload).toMatchObject({
      uid: baseFirebaseUser.uid,
      email: baseFirebaseUser.email,
      isAdmin: false,
      isScorer: false,
      isPlayer: true,
    });
    expect(result.isAdmin).toBe(false);
    expect(result.isPlayer).toBe(true);
  });

  it('promotes new users whose email is on the admin allowlist', async () => {
    getDocMock.mockResolvedValueOnce({
      exists: () => false,
      data: () => undefined,
    });

    const adminUser = {
      ...baseFirebaseUser,
      email: 'akhilreddydanda3@gmail.com',
    };

    const result = await createOrUpdateUser(adminUser);

    const setPayload = setDocMock.mock.calls[0][1];
    expect(setPayload).toMatchObject({
      email: adminUser.email,
      isAdmin: true,
      isScorer: true,
      isPlayer: false,
    });
    expect(result.isAdmin).toBe(true);
    expect(result.isScorer).toBe(true);
    expect(result.isPlayer).toBe(false);
  });
});
