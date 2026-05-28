'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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
import type { AppData, AppSettings, Chapter, DoubtLog, NoteLog, ProgressLog, Subject, TipLog, DailySummary } from '@/lib/jee-os/types'

const COLLECTION_NAME = 'user-data'

const initialSettings: AppSettings = {
  excludeStep3FromCalculations: false
}

const initialData: AppData = {
  subjects: {
    Physics: [],
    Chemistry: [],
    Mathematics: []
  },
  progressLogs: [],
  tipLogs: [],
  noteLogs: [],
  doubtLogs: [],
  dailySummaries: [],
  schoolProgress: {
    Physics: { chapter: '', index: 0 },
    Chemistry: { chapter: '', index: 0 },
    Mathematics: { chapter: '', index: 0 }
  },
  dailyGoal: 50,
  streakData: {
    current: 0,
    lastDate: ''
  },
  settings: initialSettings
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
  doubts: chapter.doubts ?? [],
  step3Sections: chapter.step3Sections ?? {}
})

const recalculateChapterProgress = (data: AppData): AppData => {
  const recalculated = { ...data }
  const chaptersBySubject = { ...data.subjects }
  
  ;(['Physics', 'Chemistry', 'Mathematics'] as Subject[]).forEach(subject => {
    chaptersBySubject[subject] = chaptersBySubject[subject].map(ch => ({
      ...ch,
      exerciseDone: 0,
      step2Done: 0,
      step3Done: 0,
      doubts: [],
      revisionCount: 0,
      lastTouched: ''
    }))
  })
  
  data.progressLogs.forEach(log => {
    const chapters = [...chaptersBySubject[log.subject]]
    const idx = chapters.findIndex(c => c.name === log.chapter)
    if (idx >= 0) {
      const ch = { ...chapters[idx] }
      if (log.type === 'Exercise') {
        ch.exerciseDone = Math.min(ch.exerciseTotal, ch.exerciseDone + log.solved)
      } else if (log.type === 'Step 2') {
        ch.step2Done = Math.min(ch.step2Total, ch.step2Done + log.solved)
      } else if (log.type === 'Step 3') {
        const step3Solved = log.step3Question ?? log.solved
        ch.step3Done = Math.min(ch.step3Total, ch.step3Done + step3Solved)
      }
      ch.doubts = [...ch.doubts, ...log.doubtList]
      ch.revisionCount = log.flagged ? ch.revisionCount + 1 : ch.revisionCount
      ch.lastTouched = log.date
      chapters[idx] = ch
    }
    chaptersBySubject[log.subject] = chapters
  })
  
  recalculated.subjects = chaptersBySubject
  return recalculated
}

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
  noteLogs: raw.noteLogs ?? [],
  doubtLogs: raw.doubtLogs ?? [],
  dailySummaries: raw.dailySummaries ?? [],
  settings: {
    ...initialSettings,
    ...(raw.settings || {})
  }
})

async function saveToFirestore(userId: string, data: AppData, operation: string) {
  console.log(`[Firestore] Saving data - Operation: ${operation}`)
  try {
    const userDocRef = doc(db, COLLECTION_NAME, userId)
    await setDoc(userDocRef, {
      data,
      lastSyncedAt: serverTimestamp(),
      version: 1,
    }, { merge: true })
    console.log(`[Firestore] Save successful - Operation: ${operation}`)
  } catch (error) {
    console.error(`[Firestore] Save failed - Operation: ${operation}`, error)
    throw error
  }
}

export default function JeeOSPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [data, setData] = useState<AppData>(initialData)
  const [activePage, setActivePage] = useState('overview')
  const [toast, setToast] = useState<{ message: string; show: boolean }>({ message: '', show: false })
  const [isLoaded, setIsLoaded] = useState(false)
  const dataRef = useRef<AppData>(initialData)
  dataRef.current = data

  const firebaseEnabled = !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  )

  useEffect(() => {
    if (firebaseEnabled && !authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, firebaseEnabled, router])

  useEffect(() => {
    const loadData = async () => {
      if (!user) {
        setData(initialData)
        setIsLoaded(true)
        return
      }

      console.log('[Firestore] Loading data from cloud')
      try {
        const userDocRef = doc(db, COLLECTION_NAME, user.uid)
        const docSnap = await getDoc(userDocRef)

        if (docSnap.exists()) {
          const storedData = docSnap.data().data as AppData
          const normalized = normalizeData(storedData)
          setData(recalculateChapterProgress(normalized))
          console.log('[Firestore] Data loaded successfully from cloud')
        } else {
          setData(initialData)
          console.log('[Firestore] No data found in cloud, using initial data')
        }
      } catch (error) {
        console.error('[Firestore] Error loading data from cloud:', error)
        setData(initialData)
        showToast('Failed to load cloud data, using initial state')
      }

      setIsLoaded(true)
    }

    loadData()
  }, [user])

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
    setData(prev => {
      const newData = {
        ...prev,
        subjects: {
          ...prev.subjects,
          [subject]: [...prev.subjects[subject], chapter]
        }
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'add-chapter').catch(e => console.error(e))
      }
      return newData
    })
    showToast(`Chapter "${chapter.name}" added to ${subject}`)
  }, [user, firebaseEnabled, showToast])

  const editChapter = useCallback((subject: Subject, oldName: string, updatedChapter: Chapter) => {
    setData(prev => {
      const subjectChapters = [...prev.subjects[subject]]
      const idx = subjectChapters.findIndex(c => c.name === oldName)
      if (idx >= 0) {
        subjectChapters[idx] = updatedChapter
      }
      const newData = {
        ...prev,
        subjects: {
          ...prev.subjects,
          [subject]: subjectChapters
        }
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'edit-chapter').catch(e => console.error(e))
      }
      return newData
    })
    showToast(`Chapter updated`)
  }, [user, firebaseEnabled, showToast])

  const deleteChapter = useCallback((subject: Subject, chapterName: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        subjects: {
          ...prev.subjects,
          [subject]: prev.subjects[subject].filter(c => c.name !== chapterName)
        },
        progressLogs: prev.progressLogs.filter(l => !(l.subject === subject && l.chapter === chapterName))
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'delete-chapter').catch(e => console.error(e))
      }
      return newData
    })
    showToast(`Chapter "${chapterName}" deleted`)
  }, [user, firebaseEnabled, showToast])

  const toggleExcludeStep3 = useCallback((exclude: boolean) => {
    setData(prev => {
      const newData = {
        ...prev,
        settings: {
          ...(prev.settings || initialSettings),
          excludeStep3FromCalculations: exclude
        }
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'toggle-exclude-step3').catch(e => console.error(e))
      }
      return newData
    })
    showToast(exclude ? 'Step 3 excluded from calculations' : 'Step 3 included in calculations')
  }, [user, firebaseEnabled, showToast])

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
        } else if (normalizedLog.type === 'Step 3') {
          const step3Solved = normalizedLog.step3Question ?? normalizedLog.solved
          chapter.step3Done = Math.min(chapter.step3Total, chapter.step3Done + step3Solved)
          if (normalizedLog.step3Section) {
            chapter.step3Sections = { ...(chapter.step3Sections || {}) }
            if (normalizedLog.step3TotalInSection) {
              chapter.step3Sections[normalizedLog.step3Section] = normalizedLog.step3TotalInSection
            }
          }
        }
        chapter.doubts = [...chapter.doubts, ...normalizedLog.doubtList]
        chapter.revisionCount = normalizedLog.flagged ? chapter.revisionCount + 1 : chapter.revisionCount
        chapter.lastTouched = today
        subjectChapters[chapterIdx] = chapter
      }

      const newData = {
        ...prev,
        progressLogs: [normalizedLog, ...prev.progressLogs],
        streakData: newStreakData,
        subjects: {
          ...prev.subjects,
          [normalizedLog.subject]: subjectChapters
        }
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'log-progress').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Progress logged successfully!')
    return true
  }, [user, firebaseEnabled, showToast])

  const addTipLog = useCallback((tip: TipLog) => {
    if (!tip.chapter) {
      showToast('Please select a chapter for tip')
      return false
    }
    if (!tip.prompt.trim()) {
      showToast('Tip prompt cannot be empty')
      return false
    }
    setData(prev => {
      const newData = {
        ...prev,
        tipLogs: [tip, ...prev.tipLogs]
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'add-tip').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Tip saved')
    return true
  }, [user, firebaseEnabled, showToast])

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
      const newData = {
        ...prev,
        noteLogs: [{ ...note, notesProgress: safeProgress }, ...prev.noteLogs],
        subjects: {
          ...prev.subjects,
          [note.subject]: subjectChapters
        }
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'add-note').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Note progress saved')
    return true
  }, [user, firebaseEnabled, showToast])

  const addDoubtLog = useCallback((doubt: DoubtLog) => {
    if (!doubt.chapter) {
      showToast('Please select a chapter for doubt log')
      return false
    }
    setData(prev => {
      const newData = {
        ...prev,
        doubtLogs: [doubt, ...prev.doubtLogs]
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'add-doubt').catch(e => console.error(e))
      }
      return newData
    })
    showToast(doubt.resolved ? 'Hard question logged' : 'Doubt logged')
    return true
  }, [user, firebaseEnabled, showToast])

  const addDailySummary = useCallback((summary: DailySummary) => {
    if (!summary.summary.trim()) {
      showToast('Summary cannot be empty')
      return false
    }
    setData(prev => {
      const newData = {
        ...prev,
        dailySummaries: [summary, ...prev.dailySummaries]
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'add-summary').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Daily summary saved')
    return true
  }, [user, firebaseEnabled, showToast])

  const updateDailySummary = useCallback((summary: DailySummary) => {
    setData(prev => {
      const newData = {
        ...prev,
        dailySummaries: prev.dailySummaries.map(s => s.id === summary.id ? summary : s)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-summary').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Summary updated')
  }, [user, firebaseEnabled, showToast])

  const deleteDailySummary = useCallback((summaryId: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        dailySummaries: prev.dailySummaries.filter(s => s.id !== summaryId)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'delete-summary').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Summary deleted')
  }, [user, firebaseEnabled, showToast])

  const updateProgressLog = useCallback((log: ProgressLog) => {
    setData(prev => {
      const newData = {
        ...prev,
        progressLogs: prev.progressLogs.map(l => l.id === log.id ? log : l)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-progress-log').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Progress log updated')
  }, [user, firebaseEnabled, showToast])

  const deleteProgressLog = useCallback((logId: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        progressLogs: prev.progressLogs.filter(l => l.id !== logId)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'delete-progress-log').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Progress log deleted')
  }, [user, firebaseEnabled, showToast])

  const updateTipLog = useCallback((tip: TipLog) => {
    setData(prev => {
      const newData = {
        ...prev,
        tipLogs: prev.tipLogs.map(t => t.id === tip.id ? tip : t)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-tip').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Tip updated')
  }, [user, firebaseEnabled, showToast])

  const deleteTipLog = useCallback((tipId: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        tipLogs: prev.tipLogs.filter(t => t.id !== tipId)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'delete-tip').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Tip deleted')
  }, [user, firebaseEnabled, showToast])

  const updateNoteLog = useCallback((note: NoteLog) => {
    setData(prev => {
      const newData = {
        ...prev,
        noteLogs: prev.noteLogs.map(n => n.id === note.id ? note : n)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-note').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Note updated')
  }, [user, firebaseEnabled, showToast])

  const deleteNoteLog = useCallback((noteId: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        noteLogs: prev.noteLogs.filter(n => n.id !== noteId)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'delete-note').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Note deleted')
  }, [user, firebaseEnabled, showToast])

  const updateDoubtLog = useCallback((doubt: DoubtLog) => {
    setData(prev => {
      const newData = {
        ...prev,
        doubtLogs: prev.doubtLogs.map(d => d.id === doubt.id ? doubt : d)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-doubt').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Doubt log updated')
  }, [user, firebaseEnabled, showToast])

  const deleteDoubtLog = useCallback((doubtId: string) => {
    setData(prev => {
      const newData = {
        ...prev,
        doubtLogs: prev.doubtLogs.filter(d => d.id !== doubtId)
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'delete-doubt').catch(e => console.error(e))
      }
      return newData
    })
    showToast('Doubt log deleted')
  }, [user, firebaseEnabled, showToast])

  const updateSchoolProgress = useCallback((subject: Subject, chapter: string, index: number) => {
    setData(prev => {
      const newData = {
        ...prev,
        schoolProgress: {
          ...prev.schoolProgress,
          [subject]: { chapter, index }
        }
      }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-school-progress').catch(e => console.error(e))
      }
      return newData
    })
    showToast(`School progress updated for ${subject}`)
  }, [user, firebaseEnabled, showToast])

  const updateDailyGoal = useCallback((goal: number) => {
    setData(prev => {
      const newData = { ...prev, dailyGoal: goal }
      if (user && firebaseEnabled) {
        saveToFirestore(user.uid, newData, 'update-daily-goal').catch(e => console.error(e))
      }
      return newData
    })
    showToast(`Daily goal set to ${goal} questions`)
  }, [user, firebaseEnabled, showToast])

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
      const recalculated = recalculateChapterProgress(normalizedImported)
      setData(recalculated)
      
      if (user && firebaseEnabled) {
        try {
          await saveToFirestore(user.uid, recalculated, 'import')
          showToast('Data imported and saved to cloud!')
        } catch (error) {
          console.error('Error saving imported data:', error)
          showToast('Data imported locally, but cloud save failed')
        }
      } else {
        showToast('Data imported (local only)')
      }
    } catch {
      showToast('Failed to import data. Invalid JSON.')
    }
  }, [user, firebaseEnabled, showToast])

  const resetData = useCallback(async () => {
    if (confirm('Are you sure you want to reset all data? This cannot be undone.')) {
      setData(initialData)
      
      if (user && firebaseEnabled) {
        try {
          await saveToFirestore(user.uid, initialData, 'reset')
        } catch (error) {
          console.error('Error resetting data in Firestore:', error)
        }
      }
      
      showToast('All data has been reset')
    }
  }, [user, firebaseEnabled, showToast])

  const analytics = {
    totalQuestions: data.settings?.excludeStep3FromCalculations 
      ? data.progressLogs.filter(log => log.type !== 'Step 3').reduce((sum, log) => sum + log.solved, 0)
      : data.progressLogs.reduce((sum, log) => sum + log.solved, 0),
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
    flaggedForRevision: data.progressLogs.filter(log => log.flagged),
    excludeStep3: data.settings?.excludeStep3FromCalculations ?? false
  }

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
              addDoubtLog={addDoubtLog}
              updateProgressLog={updateProgressLog}
              deleteProgressLog={deleteProgressLog}
              updateTipLog={updateTipLog}
              deleteTipLog={deleteTipLog}
              updateNoteLog={updateNoteLog}
              deleteNoteLog={deleteNoteLog}
              updateDoubtLog={updateDoubtLog}
              deleteDoubtLog={deleteDoubtLog}
              addDailySummary={addDailySummary}
              updateDailySummary={updateDailySummary}
              deleteDailySummary={deleteDailySummary}
            />
          )}
          
          {activePage === 'physics' && (
            <SubjectPage 
              subject="Physics"
              data={data}
              color="purple"
              editChapter={editChapter}
              deleteChapter={deleteChapter}
            />
          )}
          
          {activePage === 'chemistry' && (
            <SubjectPage 
              subject="Chemistry"
              data={data}
              color="cyan"
              editChapter={editChapter}
              deleteChapter={deleteChapter}
            />
          )}
          
          {activePage === 'math' && (
            <SubjectPage 
              subject="Mathematics"
              data={data}
              color="pink"
              editChapter={editChapter}
              deleteChapter={deleteChapter}
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
              toggleExcludeStep3={toggleExcludeStep3}
            />
          )}
        </div>
      </main>
      
      <Toast message={toast.message} show={toast.show} />
    </div>
  )
}