"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { User, onAuthChange, loginWithGoogle, logout, loginAnon, db } from '@/lib/firebase'
import { doc, getDoc, setDoc } from 'firebase/firestore'

interface AuthContextType {
  user: User | null
  loading: boolean
  loginWithGoogle: () => Promise<void>
  loginAnonymously: () => Promise<void>
  signOut: () => Promise<void>
  syncData: <T>(data: T, collection: string) => Promise<void>
  loadData: <T>(collection: string) => Promise<T | null>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginAnonymously: async () => {},
  signOut: async () => {},
  syncData: async () => {},
  loadData: async () => null,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const handleLoginWithGoogle = useCallback(async () => {
    await loginWithGoogle()
  }, [])

  const handleLoginAnonymously = useCallback(async () => {
    await loginAnon()
  }, [])

  const handleSignOut = useCallback(async () => {
    await logout()
  }, [])

  const syncData = useCallback(async <T,>(data: T, collection: string) => {
    if (!user) return
    
    try {
      const userDocRef = doc(db, collection, user.uid)
      await setDoc(userDocRef, {
        data,
        updatedAt: new Date().toISOString(),
      }, { merge: true })
    } catch (error) {
      console.error('Error syncing data:', error)
    }
  }, [user])

  const loadData = useCallback(async <T,>(collection: string): Promise<T | null> => {
    if (!user) return null
    
    try {
      const userDocRef = doc(db, collection, user.uid)
      const docSnap = await getDoc(userDocRef)
      
      if (docSnap.exists()) {
        return docSnap.data().data as T
      }
      return null
    } catch (error) {
      console.error('Error loading data:', error)
      return null
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        loginWithGoogle: handleLoginWithGoogle,
        loginAnonymously: handleLoginAnonymously,
        signOut: handleSignOut,
        syncData,
        loadData,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}