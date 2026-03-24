import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Initialize Firebase only if config is available (prevents build errors)
let app;
let auth: any;
let db: any;
let storage: any;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'your_api_key_here') {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  // Ensure persistence is set for mobile WebView compatibility
  if (typeof window !== 'undefined') {
    setPersistence(auth, browserLocalPersistence).catch(err => console.error("Persistence error:", err));
  }
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // During build or if missing keys, export dummy objects
  app = null;
  auth = null;
  db = null;
  storage = null;
}

export { app, auth, db, storage };
