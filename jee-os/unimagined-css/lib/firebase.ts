import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { 
  getAuth, 
  signInAnonymously, 
  signInWithPopup, 
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged
} from "firebase/auth"
import type { User } from "firebase/auth"

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Validate that all required config is present
const requiredConfigs = [
  'apiKey',
  'authDomain', 
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId'
]

const missingConfigs = requiredConfigs.filter(
  key => !firebaseConfig[key as keyof typeof firebaseConfig]
)

if (missingConfigs.length > 0) {
  console.warn(
    `Firebase configuration is incomplete. Missing: ${missingConfigs.join(', ')}. ` +
    `Please set these environment variables in your .env.local file (development) ` +
    `or in Render's dashboard (production). Firebase features will not work until configured.`
  )
}

// Initialize Firebase (singleton pattern)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

export const db = getFirestore(app)
export const auth = getAuth(app)

// Auth provider
const googleProvider = new GoogleAuthProvider()

// Helper: Auto login user (anonymous)
export const loginAnon = async () => {
  const user = await signInAnonymously(auth)
  return user.user
}

// Helper: Sign in with Google
export const loginWithGoogle = async () => {
  const user = await signInWithPopup(auth, googleProvider)
  return user.user
}

// Helper: Sign out
export const logout = async () => {
  await signOut(auth)
}

// Helper: Get current user (synchronous)
export const getCurrentUser = (): User | null => {
  return auth.currentUser
}

// Helper: Subscribe to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback)
}

// Re-export User type for convenience
export type { User } from "firebase/auth"
