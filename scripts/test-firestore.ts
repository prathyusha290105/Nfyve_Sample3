import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

console.log('Testing Firebase with config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  hasApiKey: Boolean(firebaseConfig.apiKey),
});

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function run() {
  console.log('\n--- 1. Testing Firestore Read ---');
  try {
    const snap = await getDocs(collection(db, 'customers'));
    console.log(`Firestore connected! Found ${snap.docs.length} customer docs in 'customers' collection.`);
    snap.docs.slice(0, 3).forEach(d => console.log('Sample doc:', d.id, d.data()));
  } catch (err: any) {
    console.error('Firestore getDocs error:', err.message, err.code);
  }

  console.log('\n--- 2. Testing Firebase Auth ---');
  try {
    const cred = await signInWithEmailAndPassword(auth, 'admin@nfyve.com', 'Admin@NFYVE2026');
    console.log('Firebase Auth success for admin@nfyve.com:', cred.user.uid);
  } catch (err: any) {
    console.log('Firebase Auth result:', err.message, err.code);
  }
}

run().catch(console.error);
