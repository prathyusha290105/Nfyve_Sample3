import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId = import.meta.env.VITE_FIREBASE_APP_ID;

export const isFirebaseConfigured = Boolean(
  apiKey && 
  apiKey !== 'YOUR_FIREBASE_API_KEY' &&
  projectId && 
  projectId !== 'YOUR_PROJECT_ID'
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  try {
    const firebaseConfig = {
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId,
    };

    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    console.info('✓ Firebase SDK initialized successfully for NFYVE project:', projectId);
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
  }
} else {
  console.warn(
    'Notice: Firebase client environment variables are not set or contain placeholders. ' +
    'To connect live Firebase Authentication and Cloud Firestore, specify VITE_FIREBASE_* in your environment.'
  );
}

export { app, auth, db };

export interface FirebaseConfigStatus {
  isConfigured: boolean;
  missingVars: string[];
  projectId?: string;
}

export function getFirebaseConfigStatus(): FirebaseConfigStatus {
  const missing: string[] = [];
  if (!apiKey || apiKey === 'YOUR_FIREBASE_API_KEY') missing.push('VITE_FIREBASE_API_KEY');
  if (!projectId || projectId === 'YOUR_PROJECT_ID') missing.push('VITE_FIREBASE_PROJECT_ID');
  if (!authDomain) missing.push('VITE_FIREBASE_AUTH_DOMAIN');
  if (!appId) missing.push('VITE_FIREBASE_APP_ID');

  return {
    isConfigured: isFirebaseConfigured,
    missingVars: missing,
    projectId: isFirebaseConfigured ? projectId : undefined,
  };
}
