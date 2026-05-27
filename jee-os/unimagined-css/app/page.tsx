'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/jee-os/sidebar'
import { OverviewPage } from '@/components/jee-os/pages/overview'
import { TrackerPage } from '@/components/jee-os/pages/tracker'
import { SubjectPage } from '@/components/jee-os/pages/subject'
import { SchoolPage } from '@/components/jee-os/pages/school'
import { SettingsPage } from '@/components/jee-os/pages/settings'
import { Toast } from '@/components/jee-os/toast'
import { useAuth } from '@/components/auth-provider'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, logout } from '@/lib/firebase'
import type { AppData, Chapter, ProgressLog, Subject, TipLog, NoteLog } from '@/lib/jee-os/types'

const COLLECTION_NAME = 'user-data'

const initialData: AppData = {
  subjects: {
    Physics: [],
    Chemistry: [],
    Mathematics: []
  },
  progressLogs: [],
  tipLogs: [],
  noteLogs: [],
  schoolProgress: {
    Physics: { chapter: '', index: 0 },
    Chemistry: { chapter: '', index: 0 },
    Mathematics: { chapter: '', index: 0 }
  },
  dailyGoal: 50,
  streakData: {
    current: 0,
    lastDate: ''
  }
}

const parseDoubts = (text: string, start: number, end: number): number[] => {
  if (!text.trim()) return []
  return [...new Set(
    text
      .split(',')
      .map(v => Number(v.trim()))
      .filter(n => Number.isInteger(n) && n >= start && n <= end)
  )]
}

const normalizeChapter = (chapter: Chapter): Chapter => ({
  ...chapter,
  exerciseDone: chapter.exerciseDone ?? 0,
  step2Done: chapter.step2Done ?? 0,
  step3Done: chapter.step3Done ?? 0,
  notesProgress: chapter.notesProgress ?? 0,
  revisionCount: chapter.revisionCount ?? 0,
  lastTouched: chapter.lastTouched ?? '',
  doubts: chapter.doubts ?? []
})

const normalizeData = (raw: Partial<AppData>): AppData => ({
  ...initialData,
  ...raw,
  subjects: {
    Physics: (raw.subjects?.Physics ?? []).map(normalizeChapter),
    Chemistry: (raw.subjects?.Chemistry ?? []).map(normalizeChapter),
    Mathematics: (raw.subjects?.Mathematics ?? []).map(normalizeChapter)
  },
  progressLogs: (raw.progressLogs ?? []).map((log) => ({
    ...log,
    correct: log.correct ?? Math.max(0, log.solved - (log.doubtList?.length ?? 0)),
    attempted: log.attempted ?? Math.max(0, log.rangeEnd - log.rangeStart + 1),
    left: log.left ?? Math.max(0, (log.rangeEnd - log.rangeStart + 1) - log.solved),
    doubtList: log.doubtList ?? parseDoubts(log.doubts ?? '', log.rangeStart, log.rangeEnd)
  })),
  tipLogs: raw.tipLogs ?? [],
  noteLogs: raw.noteLogs ?? []
})

export default function JeeOSPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AppData>(initialData)
  const [activePage, setActivePage] = useState('overview')
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false })
  const [isLoaded, setIsLoaded] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)

  // Check if Firebase is configured
  const firebaseEnabled = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )

  // Redirect to login if not authenticated and Firebase is enabled
  useEffect(() => {
    if (firebaseEnabled && !authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, firebaseEnabled, router])

  // Load data from Firestore when user logs in
  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        // No user, use initial data
        setData(initialData)
        setIsLoaded(true)
        return
      }

      try {
        const userDocRef = doc(db, COLLECTION_NAME, user.uid)
        const docSnap = await getDoc(userDocRef)
        
        if (docSnap.exists()) {
          const storedData = docSnap.data().data as AppData
          setData(normalizeData(storedData))
        } else {
          // First time user, create empty document
          await setDoc(userDocRef, {
            data: initialData,
            lastSyncedAt: serverTimestamp(),
            version: 1,
          })
          setData(initialData)
        }
      } catch (error) {
        console.error('Error loading data from Firestore:', error)
        setData(initialData)
      }

      setIsLoaded(true)
    }

    loadData()
  }, [user])

  // Save data to Firestore (debounced)
  useEffect(() => {
    if (!isLoaded || !user || !firebaseEnabled) return

    const timeoutId = setTimeout(async () => {
      try {
        const userDocRef = doc(db, COLLECTION_NAME, user.uid)
        await setDoc(userDocRef, {
          data,
          lastSyncedAt: serverTimestamp(),
          version: 1,
        }, { merge: true })
      } catch (error) {
        console.error('Error saving to Firestore:', error)
      }
    }, 500) // Debounce for 500ms

    return () => clearTimeout(timeoutId)
  }, [data, isLoaded, user, firebaseEnabled])

  const showToast = useCallback((message: string) => {
    setToast({ message, show: true })
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3000)
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [router])

  const addChapter = useCallback((subject: Subject, chapter: Chapter) => {
    setData(prev => ({
      ...prev,
      subjects: {
        ...prev.subjects,
        [subject]: [...prev.subjects[subject], chapter]
      }
    }))
    showToast(`Chapter "${chapter.name}" added to ${subject}`)
  }, [showToast])

  const logProgress = useCallback((log: ProgressLog) => {
    if (!log.chapter) {
      showToast('Please select a chapter')
      return false
    }
    if (log.rangeStart < 1 || log.rangeEnd < log.rangeStart) {
      showToast('Invalid range')
      return false
    }
    const attempted = log.rangeEnd - log.rangeStart + 1
    if (log.solved < 0 || log.solved > attempted) {
      showToast('Solved count should be within range')
      return false
    }

    const doubts = parseDoubts(log.doubts, log.rangeStart, log.rangeEnd)
    const left = Math.max(0, attempted - log.solved)
    const correct = Math.max(0, log.solved - doubts.length)
    const normalizedLog: ProgressLog = {
      ...log,
      attempted,
      left,
      correct,
      doubtList: doubts,
      flagged: log.flagged || doubts.length > 0
    }

    setData(prev => {
      const today = new Date().toISOString().split('T')[0]
      const newStreakData = { ...prev.streakData }
      
      if (prev.streakData.lastDate !== today) {
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
        newStreakData.current = prev.streakData.lastDate === yesterday 
          ? prev.streakData.current + 1 
          : 1
        newStreakData.lastDate = today
      }

      const subjectChapters = [...prev.subjects[normalizedLog.subject]]
      const chapterIdx = subjectChapters.findIndex((c) => c.name === normalizedLog.chapter)
      if (chapterIdx >= 0) {
        const chapter = { ...subjectChapters[chapterIdx] }
        if (normalizedLog.type === 'Exercise') {
          chapter.exerciseDone = Math.min(chapter.exerciseTotal, chapter.exerciseDone + normalizedLog.solved)
        } else if (normalizedLog.type === 'Step 2') {
          chapter.step2Done = Math.min(chapter.step2Total, chapter.step2Done + normalizedLog.solved)
        } else {
          chapter.step3Done = Math.min(chapter.step3Total, chapter.step3Done + normalizedLog.solved)
        }
        chapter.doubts = [...chapter.doubts, ...normalizedLog.doubtList]
        chapter.revisionCount = normalizedLog.flagged ? chapter.revisionCount + 1 : chapter.revisionCount
        chapter.lastTouched = today
        subjectChapters[chapterIdx] = chapter
      }

      return {
        ...prev,
        progressLogs: [normalizedLog, ...prev.progressLogs],
        streakData: newStreakData,
        subjects: {
          ...prev.subjects,
          [normalizedLog.subject]: subjectChapters
        }
      }
    })
    showToast('Progress logged successfully!')
    return true
  }, [showToast])

  const addTipLog = useCallback((tip: TipLog) => {
    if (!tip.chapter) {
      showToast('Please select a chapter for tip')
      return false
    }
    if (!tip.prompt.trim()) {
      showToast('Tip prompt cannot be empty')
      return false
    }
    setData(prev => ({
      ...prev,
      tipLogs: [tip, ...prev.tipLogs]
    }))
    showToast('Tip saved')
    return true
  }, [showToast])

  const addNoteLog = useCallback((note: NoteLog) => {
    if (!note.chapter) {
      showToast('Please select a chapter for note')
      return false
    }
    const safeProgress = Math.min(100, Math.max(0, note.notesProgress))
    setData(prev => {
      const subjectChapters = [...prev.subjects[note.subject]]
      const idx = subjectChapters.findIndex((c) => c.name === note.chapter)
      if (idx >= 0) {
        subjectChapters[idx] = {
          ...subjectChapters[idx],
          notesProgress: Math.max(subjectChapters[idx].notesProgress, safeProgress),
          lastTouched: note.date
        }
      }
      return {
        ...prev,
        noteLogs: [{ ...note, notesProgress: safeProgress }, ...prev.noteLogs],
        subjects: {
          ...prev.subjects,
          [note.subject]: subjectChapters
        }
      }
    })
    showToast('Note progress saved')
    return true
  }, [showToast])

  const updateSchoolProgress = useCallback((subject: Subject, chapter: string, index: number) => {
    setData(prev => ({
      ...prev,
      schoolProgress: {
        ...prev.schoolProgress,
        [subject]: { chapter, index }
      }
    }))
    showToast(`School progress updated for ${subject}`)
  }, [showToast])

  const updateDailyGoal = useCallback((goal: number) => {
    setData(prev => ({ ...prev, dailyGoal: goal }))
    showToast(`Daily goal set to ${goal} questions`)
  }, [showToast])

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jee-os-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Data exported successfully!')
  }, [data, showToast])

  const importData = useCallback(async (jsonData: string) => {
    try {
      const imported = JSON.parse(jsonData)
      const normalizedImported = normalizeData(imported)
      setData(normalizedImported)
      
      // Immediately save to Firestore
      if (user && firebaseEnabled) {
        try {
          const userDocRef = doc(db, COLLECTION_NAME, user.uid)
          await setDoc(userDocRef, {
            data: normalizedImported,
            lastSyncedAt: serverTimestamp(),
            version: 1,
          }, { merge: true })
        } catch (error) {
          console.error('Error saving imported data:', error)
        }
      }
      
      showToast('Data imported and saved to cloud!')
    } catch {
      showToast('Failed to import data. Invalid JSON.')
    }
  }, [user, firebaseEnabled, showToast])

  const resetData = useCallback(async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setData(initialData)
      
      // Also reset in Firestore
      if (user && firebaseEnabled) {
        try {
          const userDocRef = doc(db, COLLECTION_NAME, user.uid)
          await setDoc(userDocRef, {
            data: initialData,
            lastSyncedAt: serverTimestamp(),
            version: 1,
          })
        } catch (error) {
          console.error('Error resetting data in Firestore:', error)
        }
      }
      
      showToast('All data has been reset')
    }
  }, [user, firebaseEnabled, showToast])

  // Calculate analytics
  const analytics = {
    totalQuestions: data.progressLogs.reduce((sum, log) => sum + log.solved, 0),
    todayQuestions: data.progressLogs
      .filter(log => log.date === new Date().toISOString().split('T')[0])
      .reduce((sum, log) => sum + log.solved, 0),
    streak: data.streakData.current,
    subjectStats: (['Physics', 'Chemistry', 'Mathematics'] as Subject[]).map(subject => {
      const chapters = data.subjects[subject]
      const totalChapters = chapters.length
      const touchedChapters = chapters.filter(ch => {
        const logs = data.progressLogs.filter(
          log => log.subject === subject && log.chapter === ch.name
        )
        return logs.length > 0
      }).length
      return { subject, totalChapters, touchedChapters }
    }),
    flaggedForRevision: data.progressLogs.filter(log => log.flagged)
  }

  // Show loading state
  if (authLoading || !isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[var(--neon-purple)] border-t-transparent rounded-full animate-spin" />
          <span className="text-[var(--text-muted)] text-sm font-mono">Initializing JEE OS...</span>
        </div>
      </div>
    )
  }

  // If Firebase is enabled and user is not logged in, don't render (will redirect)
  if (firebaseEnabled && !user) {
    return null
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage}
        user={user}
        onLogout={firebaseEnabled ? handleLogout : undefined}
      />
      
      <main className="flex-1 overflow-y-auto p-4 lg:p-6 lg:h-[100dvh]">
        <div className="max-w-[1400px] mx-auto">
          {activePage === 'overview' && (
            <OverviewPage 
              data={data} 
              analytics={analytics}
            />
          )}
          
          {activePage === 'tracker' && (
            <TrackerPage 
              data={data}
              logProgress={logProgress}
              addTipLog={addTipLog}
              addNoteLog={addNoteLog}
            />
          )}
          
          {activePage === 'physics' && (
            <SubjectPage 
              subject="Physics"
              data={data}
              color="purple"
            />
          )}
          
          {activePage === 'chemistry' && (
            <SubjectPage 
              subject="Chemistry"
              data={data}
              color="cyan"
            />
          )}
          
          {activePage === 'math' && (
            <SubjectPage 
              subject="Mathematics"
              data={data}
              color="pink"
            />
          )}
          
          {activePage === 'school' && (
            <SchoolPage 
              data={data}
              updateSchoolProgress={updateSchoolProgress}
            />
          )}
          
          {activePage === 'settings' && (
            <SettingsPage 
              data={data}
              addChapter={addChapter}
              updateDailyGoal={updateDailyGoal}
              exportData={exportData}
              importData={importData}
              resetData={resetData}
            />
          )}
        </div>
      </main>
      
      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}