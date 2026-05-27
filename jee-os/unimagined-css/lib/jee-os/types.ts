export type Subject = 'Physics' | 'Chemistry' | 'Mathematics'

export interface Chapter {
  name: string
  notes: string
  exerciseTotal: number
  step2Total: number
  step3Total: number
  step3Sections: Record<string, number>
  exerciseDone: number
  step2Done: number
  step3Done: number
  notesProgress: number
  revisionCount: number
  lastTouched: string
  doubts: number[]
}

export interface ProgressLog {
  id: string
  date: string
  subject: Subject
  chapter: string
  type: 'Exercise' | 'Step 2' | 'Step 3'
  rangeStart: number
  rangeEnd: number
  solved: number
  correct: number
  attempted: number
  left: number
  doubts: string
  doubtList: number[]
  notes: string
  flagged: boolean
  step3Section?: string
  step3Question?: number
  step3TotalInSection?: number
}

export interface TipLog {
  id: string
  date: string
  subject: Subject
  chapter: string
  type: 'Exercise' | 'Step 2' | 'Step 3'
  questionTags: string
  prompt: string
}

export interface NoteLog {
  id: string
  date: string
  subject: Subject
  chapter: string
  notesProgress: number
  noteText: string
}

export interface DoubtLog {
  id: string
  date: string
  subject: Subject
  chapter: string
  doubtQuestion: string
  resolved: boolean
  note: string
}

export interface DailySummary {
  id: string
  date: string
  summary: string
}

export interface SchoolProgress {
  chapter: string
  index: number
}

export interface StreakData {
  current: number
  lastDate: string
}

export interface AppSettings {
  excludeStep3FromCalculations: boolean
}

export interface AppData {
  subjects: Record<Subject, Chapter[]>
  progressLogs: ProgressLog[]
  tipLogs: TipLog[]
  noteLogs: NoteLog[]
  doubtLogs: DoubtLog[]
  dailySummaries: DailySummary[]
  schoolProgress: Record<Subject, SchoolProgress>
  dailyGoal: number
  streakData: StreakData
  settings?: AppSettings
}

export interface Analytics {
  totalQuestions: number
  todayQuestions: number
  streak: number
  subjectStats: Array<{
    subject: Subject
    totalChapters: number
    touchedChapters: number
  }>
  flaggedForRevision: ProgressLog[]
}
