// Firebase Client Initialization with resilient fallback for demo mode
let auth = null;
let db = null;
let storage = null;
let isFirebaseConfigured = false;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const requiredFirebaseSettings = [
  firebaseConfig.apiKey,
  firebaseConfig.authDomain,
  firebaseConfig.projectId,
  firebaseConfig.appId,
];

if (requiredFirebaseSettings.every(Boolean) && firebaseConfig.apiKey !== 'your_api_key_here') {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getAuth } = await import('firebase/auth');
    const { getFirestore } = await import('firebase/firestore');
    const { getStorage } = await import('firebase/storage');

    const app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    isFirebaseConfigured = true;
    console.log('[Firebase] Connected to live Cloud Firebase project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('[Firebase] Firebase live init skipped or failed, using local auth mode:', error);
  }
} else {
  console.log('[Firebase] Running in Demo Mode with instant role switching (Admin & Farmer).');
}

export { auth, db, storage, isFirebaseConfigured };
