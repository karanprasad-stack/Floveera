import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase config from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Safety check
if (!firebaseConfig.apiKey) {
  throw new Error("Firebase env variables missing");
}

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Auth
export const auth = getAuth(app);

// Google Login Function
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);

    const user = result.user;

    return {
      name: user.displayName,
      email: user.email,
      photo: user.photoURL,
      uid: user.uid,
    };
  } catch (error) {
    console.error("Google Login Error:", error);
    throw error;
  }
};