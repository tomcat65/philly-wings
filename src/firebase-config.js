import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Check if we should use emulators
const useEmulators = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Initialize Firestore with modern persistence (emulator-aware)
export const db = getFirestore(app, useEmulators ? undefined : {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager()
  })
});

// Initialize other services
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const functions = getFunctions(app);

// Connect to emulators in development (MUST be before any queries)
if (useEmulators) {
  console.log('🧪 Connecting to Firebase Emulators...');
  connectFirestoreEmulator(db, '127.0.0.1', 8081);
  connectFunctionsEmulator(functions, '127.0.0.1', 5002);
  connectStorageEmulator(storage, '127.0.0.1', 9199);
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}

export default app;
