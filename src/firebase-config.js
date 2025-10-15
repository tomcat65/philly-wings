import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
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

// Initialize services
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
export const functions = getFunctions(app);

// Connect to emulators in development (TEMPORARILY DISABLED - using production for testing new sections)
// if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
//   console.log('🧪 Connecting to Firebase Emulators...');
//   connectFirestoreEmulator(db, 'localhost', 8081);
//   connectFunctionsEmulator(functions, 'localhost', 5002);
//   connectStorageEmulator(storage, 'localhost', 9199);
//   connectAuthEmulator(auth, 'http://localhost:9099');
// }

// Enable offline persistence (updated for Firebase v10+)
enableIndexedDbPersistence(db, {
  forceOwnership: false
}).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Persistence failed: Multiple tabs open');
  } else if (err.code === 'unimplemented') {
    console.warn('Persistence not available');
  }
});

export default app;
