import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Firebaseの設定情報
const firebaseConfig = {
  apiKey: "AIzaSyBBgfcR2r3rbbpPPGlE52hsUzQzBVV4Izw",
  authDomain: "onsen-app-4593e.firebaseapp.com",
  projectId: "onsen-app-4593e",
  storageBucket: "onsen-app-4593e.firebasestorage.app",
  messagingSenderId: "564210233694",
  appId: "1:564210233694:web:e0b9643b0b059ab63d1fcf"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
