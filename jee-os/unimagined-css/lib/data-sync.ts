import { db } from './firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import type { AppData } from './jee-os/types'

const COLLECTION_NAME = 'user-data'

export interface SyncedData {
  data: AppData
  lastSyncedAt: string
  version: number
}

const CURRENT_VERSION = 1

/**
 * Save data to Firestore (only called on explicit save actions)
 */
export async function saveToFirestore(userId: string, data: AppData, operation: string): Promise<void> {
  try {
    console.log(`[Firestore] Saving data for operation: ${operation}`)
    const userDocRef = doc(db, COLLECTION_NAME, userId)
    await setDoc(userDocRef, {
      data,
      lastSyncedAt: serverTimestamp(),
      version: CURRENT_VERSION,
    }, { merge: true })
    console.log(`[Firestore] Data saved successfully for: ${operation}`)
  } catch (error) {
    console.error(`[Firestore] Error saving data for ${operation}:`, error)
    throw error
  }
}

/**
 * Load data from Firestore
 */
export async function loadFromFirestore(userId: string): Promise<SyncedData | null> {
  try {
    const userDocRef = doc(db, COLLECTION_NAME, userId)
    const docSnap = await getDoc(userDocRef)
    
    if (docSnap.exists()) {
      const syncedData = docSnap.data() as SyncedData
      console.log('Data loaded from Firestore')
      return syncedData
    }
    
    console.log('No data found in Firestore')
    return null
  } catch (error) {
    console.error('Error loading from Firestore:', error)
    return null
  }
}

/**
 * Merge local and remote data
 * Remote data takes precedence if it's newer
 */
export function mergeData(
  localData: AppData | null,
  remoteData: SyncedData | null
): AppData | null {
  if (!remoteData) return localData
  if (!localData) return remoteData.data
  
  // Compare timestamps
  const remoteTime = new Date(remoteData.lastSyncedAt).getTime()
  const localTime = getLocalDataTimestamp(localData)
  
  // Return the newer data
  return remoteTime > localTime ? remoteData.data : localData
}

/**
 * Get timestamp from local data (uses progressLogs as reference)
 */
function getLocalDataTimestamp(data: AppData): number {
  if (!data.progressLogs || data.progressLogs.length === 0) {
    return 0
  }
  
  // Find the most recent log entry
  const latestLog = data.progressLogs.reduce((latest, log) => {
    const logTime = new Date(log.date).getTime()
    return logTime > latest ? logTime : latest
  }, 0)
  
  return latestLog
}

/**
 * Check if Firebase is properly configured
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )
}