'use client'

import { useState, useRef } from 'react'
import { Settings as SettingsIcon, Plus, Target, Download, Upload, Trash2, Database, ToggleLeft } from 'lucide-react'
import type { AppData, AppSettings, Chapter, Subject } from '@/lib/jee-os/types'

interface SettingsPageProps {
  data: AppData
  addChapter: (subject: Subject, chapter: Chapter) => void
  updateDailyGoal: (goal: number) => void
  exportData: () => void
  importData: (json: string) => void
  resetData: () => void
  toggleExcludeStep3: (exclude: boolean) => void
}

export function SettingsPage({ 
  data, 
  addChapter, 
  updateDailyGoal, 
  exportData, 
  importData, 
  resetData,
  toggleExcludeStep3
}: SettingsPageProps) {
  const [dailyGoalInput, setDailyGoalInput] = useState(data.dailyGoal)
  const [excludeStep3, setExcludeStep3] = useState(data.settings?.excludeStep3FromCalculations ?? false)
  const [chapterForm, setChapterForm] = useState({
    subject: 'Physics' as Subject,
    name: '',
    notes: '',
    exerciseTotal: 0,
    step2Total: 0,
    step3Total: 0
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateDailyGoal(dailyGoalInput)
  }

  const handleChapterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chapterForm.name.trim()) {
      alert('Please enter a chapter name')
      return
    }
    
    addChapter(chapterForm.subject, {
      name: chapterForm.name,
      notes: chapterForm.notes,
      exerciseTotal: chapterForm.exerciseTotal,
      step2Total: chapterForm.step2Total,
      step3Total: chapterForm.step3Total,
      step3Sections: {},
      exerciseDone: 0,
      step2Done: 0,
      step3Done: 0,
      notesProgress: 0,
      revisionCount: 0,
      lastTouched: '',
      doubts: []
    })

    setChapterForm(prev => ({
      ...prev,
      name: '',
      notes: '',
      exerciseTotal: 0,
      step2Total: 0,
      step3Total: 0
    }))
  }

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      importData(content)
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-entrance">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--text-muted)] to-[var(--text-ghost)] flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Settings
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Manage your setup and data</p>
          </div>
        </div>
      </div>

      {/* Daily Goal */}
      <div className="glass-card p-6 animate-entrance animate-entrance-1">
        <div className="flex items-center gap-2 mb-6">
          <Target className="w-4 h-4 text-[var(--neon-purple)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Daily Goal</span>
        </div>

        <form onSubmit={handleGoalSubmit} className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1">
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">
              Target questions / day
            </span>
            <input
              type="number"
              min={1}
              value={dailyGoalInput}
              onChange={e => setDailyGoalInput(parseInt(e.target.value) || 1)}
              className="input-void font-mono"
            />
          </label>
          <div className="flex items-end">
            <button type="submit" className="btn-neon">
              Save Goal
            </button>
          </div>
        </form>
      </div>

      {/* Step 3 Toggle */}
      <div className="glass-card p-6 animate-entrance animate-entrance-1-5">
        <div className="flex items-center gap-2 mb-6">
          <ToggleLeft className="w-4 h-4 text-[var(--neon-amber)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Step 3 Calculations</span>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-[var(--text-primary)]">
              {excludeStep3 ? 'Step 3: EXCLUDED' : 'Step 3: INCLUDED'}
            </span>
            <p className="text-[10px] text-[var(--text-muted)] mt-1">
              {excludeStep3 
                ? "Step 3 questions excluded from totals and percentages"
                : "Step 3 questions included in progress calculations"
              }
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              const newState = !excludeStep3
              setExcludeStep3(newState)
              toggleExcludeStep3?.(newState)
            }}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              excludeStep3 ? 'bg-[var(--neon-purple)]' : 'bg-[var(--neon-green)]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                excludeStep3 ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Add Chapter */}
      <div className="glass-card p-6 animate-entrance animate-entrance-2">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-4 h-4 text-[var(--neon-cyan)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Add Chapter</span>
        </div>

        <form onSubmit={handleChapterSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Subject</span>
              <select
                value={chapterForm.subject}
                onChange={e => setChapterForm(prev => ({ ...prev, subject: e.target.value as Subject }))}
                className="input-void select-void"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Chapter Name</span>
              <input
                type="text"
                value={chapterForm.name}
                onChange={e => setChapterForm(prev => ({ ...prev, name: e.target.value }))}
                className="input-void"
                placeholder="e.g. Kinematics"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Notes</span>
              <input
                type="text"
                value={chapterForm.notes}
                onChange={e => setChapterForm(prev => ({ ...prev, notes: e.target.value }))}
                className="input-void"
                placeholder="Optional notes..."
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Exercise Total</span>
              <input
                type="number"
                min={0}
                value={chapterForm.exerciseTotal}
                onChange={e => setChapterForm(prev => ({ ...prev, exerciseTotal: parseInt(e.target.value) || 0 }))}
                className="input-void font-mono"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Step 2 Total</span>
              <input
                type="number"
                min={0}
                value={chapterForm.step2Total}
                onChange={e => setChapterForm(prev => ({ ...prev, step2Total: parseInt(e.target.value) || 0 }))}
                className="input-void font-mono"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Step 3 Total</span>
              <input
                type="number"
                min={0}
                value={chapterForm.step3Total}
                onChange={e => setChapterForm(prev => ({ ...prev, step3Total: parseInt(e.target.value) || 0 }))}
                className="input-void font-mono"
              />
            </label>
          </div>

          <button type="submit" className="btn-neon">
            Add Chapter
          </button>
        </form>
      </div>

      {/* Data Management */}
      <div className="glass-card p-6 animate-entrance animate-entrance-3">
        <div className="flex items-center gap-2 mb-6">
          <Database className="w-4 h-4 text-[var(--neon-green)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Data</span>
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={exportData} className="btn-neon flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export JSON
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="btn-neon btn-ghost flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import JSON
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileImport}
            className="hidden"
          />
          
          <button onClick={resetData} className="btn-neon btn-danger flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            Reset All
          </button>
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--border-subtle)]">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-[var(--neon-purple)] tabular-nums">
                {Object.values(data.subjects).flat().length}
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[var(--text-ghost)] uppercase">Chapters</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--neon-cyan)] tabular-nums">
                {data.progressLogs.length}
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[var(--text-ghost)] uppercase">Logs</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-[var(--neon-pink)] tabular-nums">
                {data.progressLogs.reduce((sum, log) => sum + log.solved, 0)}
              </div>
              <div className="text-[10px] font-bold tracking-widest text-[var(--text-ghost)] uppercase">Solved</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
