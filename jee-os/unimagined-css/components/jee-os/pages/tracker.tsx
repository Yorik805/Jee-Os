'use client'

import { useState } from 'react'
import { BookOpen, Plus, Clock, AlertTriangle } from 'lucide-react'
import type { AppData, ProgressLog, Subject, TipLog, NoteLog } from '@/lib/jee-os/types'

interface TrackerPageProps {
  data: AppData
  logProgress: (log: ProgressLog) => boolean
  addTipLog: (tip: TipLog) => boolean
  addNoteLog: (note: NoteLog) => boolean
}

export function TrackerPage({ data, logProgress, addTipLog, addNoteLog }: TrackerPageProps) {
  const [formData, setFormData] = useState({
    subject: 'Physics' as Subject,
    chapter: '',
    type: 'Exercise' as 'Exercise' | 'Step 2' | 'Step 3',
    rangeStart: 1,
    rangeEnd: 10,
    solved: 0,
    doubts: '',
    notes: '',
    flagged: false
  })
  const [tipData, setTipData] = useState({
    subject: 'Physics' as Subject,
    chapter: '',
    type: 'Exercise' as 'Exercise' | 'Step 2' | 'Step 3',
    questionTags: '',
    prompt: ''
  })
  const [noteData, setNoteData] = useState({
    subject: 'Physics' as Subject,
    chapter: '',
    notesProgress: 0,
    noteText: ''
  })

  const chapters = data.subjects[formData.subject]
  const tipChapters = data.subjects[tipData.subject]
  const noteChapters = data.subjects[noteData.subject]

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const attempted = formData.rangeEnd - formData.rangeStart + 1
    const log: ProgressLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      subject: formData.subject,
      chapter: formData.chapter,
      type: formData.type,
      rangeStart: formData.rangeStart,
      rangeEnd: formData.rangeEnd,
      solved: formData.solved,
      correct: Math.max(0, formData.solved),
      attempted,
      left: Math.max(0, attempted - formData.solved),
      doubts: formData.doubts,
      doubtList: [],
      notes: formData.notes,
      flagged: formData.flagged
    }

    const ok = logProgress(log)
    if (!ok) return

    setFormData(prev => ({
      ...prev,
      rangeStart: prev.rangeEnd + 1,
      rangeEnd: prev.rangeEnd + 10,
      solved: 0,
      doubts: '',
      notes: '',
      flagged: false
    }))
  }

  const handleTipSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const tip: TipLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      subject: tipData.subject,
      chapter: tipData.chapter,
      type: tipData.type,
      questionTags: tipData.questionTags.trim(),
      prompt: tipData.prompt.trim()
    }
    const ok = addTipLog(tip)
    if (!ok) return
    setTipData(prev => ({ ...prev, questionTags: '', prompt: '' }))
  }

  const handleNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const note: NoteLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      subject: noteData.subject,
      chapter: noteData.chapter,
      notesProgress: noteData.notesProgress,
      noteText: noteData.noteText.trim()
    }
    const ok = addNoteLog(note)
    if (!ok) return
    setNoteData(prev => ({ ...prev, notesProgress: 0, noteText: '' }))
  }

  return (
    <div className="space-y-6 animate-entrance">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-cyan)] to-[var(--neon-green)] flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">Question Log</h1>
            <p className="text-sm text-[var(--text-muted)]">Range-based progress logging with doubts tracking</p>
          </div>
        </div>
      </div>

      <div className="glass-card p-6 animate-entrance animate-entrance-1">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-4 h-4 text-[var(--neon-purple)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Log Progress</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Subject</span>
              <select
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value as Subject, chapter: '' }))}
                className="input-void select-void"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Chapter</span>
              <select
                value={formData.chapter}
                onChange={e => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                className="input-void select-void"
              >
                <option value="">Select chapter...</option>
                {chapters.map(ch => (
                  <option key={ch.name} value={ch.name}>{ch.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Question Type</span>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as typeof formData.type }))}
                className="input-void select-void"
              >
                <option>Exercise</option>
                <option>Step 2</option>
                <option>Step 3</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Start</span>
              <input
                type="number"
                min={1}
                value={formData.rangeStart}
                onChange={e => setFormData(prev => ({ ...prev, rangeStart: parseInt(e.target.value) || 1 }))}
                className="input-void text-center font-mono"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">End</span>
              <input
                type="number"
                min={1}
                value={formData.rangeEnd}
                onChange={e => setFormData(prev => ({ ...prev, rangeEnd: parseInt(e.target.value) || 1 }))}
                className="input-void text-center font-mono"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Solved</span>
              <input
                type="number"
                min={0}
                value={formData.solved}
                onChange={e => setFormData(prev => ({ ...prev, solved: parseInt(e.target.value) || 0 }))}
                className="input-void text-center font-mono"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Doubt Questions</span>
              <input
                type="text"
                placeholder="e.g. 8,12,19"
                value={formData.doubts}
                onChange={e => setFormData(prev => ({ ...prev, doubts: e.target.value }))}
                className="input-void font-mono text-sm"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Flag for Revision?</span>
              <select
                value={formData.flagged ? '1' : '0'}
                onChange={e => setFormData(prev => ({ ...prev, flagged: e.target.value === '1' }))}
                className="input-void select-void"
              >
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Notes</span>
            <input
              type="text"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="input-void"
            />
          </label>

          <button type="submit" className="btn-neon w-full md:w-auto">Save Progress</button>
        </form>
      </div>

      <div className="glass-card p-6 animate-entrance animate-entrance-2">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-4 h-4 text-[var(--neon-cyan)]" />
          <span className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase">Progress History</span>
        </div>

        {data.progressLogs.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-ghost)]">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No progress logged yet</p>
            <p className="text-sm mt-1">Start logging your progress above!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-void">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Subject</th>
                  <th>Chapter</th>
                  <th>Type</th>
                  <th>Range</th>
                  <th>Solved</th>
                  <th>Left</th>
                  <th>Doubts</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {data.progressLogs.slice(0, 50).map(log => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs">{log.date}</td>
                    <td>
                      <span className={`tag-void ${
                        log.subject === 'Physics' ? 'tag-purple' :
                        log.subject === 'Chemistry' ? 'tag-cyan' : 'tag-pink'
                      }`}>
                        {log.subject.slice(0, 3).toUpperCase()}
                      </span>
                    </td>
                    <td className="text-[var(--text-primary)] font-medium">{log.chapter}</td>
                    <td className="text-xs">{log.type}</td>
                    <td className="font-mono text-xs">{log.rangeStart}-{log.rangeEnd}</td>
                    <td className="font-mono text-[var(--neon-green)]">{log.solved}</td>
                    <td className="font-mono text-[var(--neon-red)]">{log.left}</td>
                    <td className="font-mono text-xs text-[var(--neon-amber)]">{log.doubts || '-'}</td>
                    <td className="text-xs text-[var(--text-muted)] max-w-[200px] truncate">{log.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="glass-card p-6 animate-entrance animate-entrance-3">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-4 h-4 text-[var(--neon-pink)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Tip Log</span>
        </div>

        <form onSubmit={handleTipSubmit} className="space-y-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Subject</span>
              <select
                value={tipData.subject}
                onChange={e => setTipData(prev => ({ ...prev, subject: e.target.value as Subject, chapter: '' }))}
                className="input-void select-void"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Chapter</span>
              <select
                value={tipData.chapter}
                onChange={e => setTipData(prev => ({ ...prev, chapter: e.target.value }))}
                className="input-void select-void"
              >
                <option value="">Select chapter...</option>
                {tipChapters.map(ch => (
                  <option key={ch.name} value={ch.name}>{ch.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Type</span>
              <select
                value={tipData.type}
                onChange={e => setTipData(prev => ({ ...prev, type: e.target.value as typeof tipData.type }))}
                className="input-void select-void"
              >
                <option>Exercise</option>
                <option>Step 2</option>
                <option>Step 3</option>
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Question Tags</span>
              <input
                type="text"
                placeholder="e.g. 5-34 | 12,19,24"
                value={tipData.questionTags}
                onChange={e => setTipData(prev => ({ ...prev, questionTags: e.target.value }))}
                className="input-void font-mono text-sm"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Tip Prompt</span>
              <input
                type="text"
                placeholder="Write your solving tip/suggestion..."
                value={tipData.prompt}
                onChange={e => setTipData(prev => ({ ...prev, prompt: e.target.value }))}
                className="input-void"
              />
            </label>
          </div>
          <button type="submit" className="btn-neon w-full md:w-auto">Save Tip</button>
        </form>

        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {data.tipLogs.length === 0 ? (
            <p className="text-sm text-[var(--text-ghost)]">No tips saved yet.</p>
          ) : data.tipLogs.slice(0, 20).map((tip) => (
            <div key={tip.id} className="p-3 rounded-lg bg-[var(--void-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1 text-xs text-[var(--text-muted)]">
                <span>{tip.date}</span>
                <span>{tip.subject}</span>
                <span>{tip.chapter}</span>
                <span>{tip.type}</span>
              </div>
              <div className="text-sm text-[var(--text-primary)] mb-1">{tip.prompt}</div>
              <div className="text-xs font-mono text-[var(--neon-amber)]">{tip.questionTags || '-'}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 animate-entrance animate-entrance-4">
        <div className="flex items-center gap-2 mb-6">
          <Plus className="w-4 h-4 text-[var(--neon-green)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Note Log</span>
        </div>

        <form onSubmit={handleNoteSubmit} className="space-y-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Subject</span>
              <select
                value={noteData.subject}
                onChange={e => setNoteData(prev => ({ ...prev, subject: e.target.value as Subject, chapter: '' }))}
                className="input-void select-void"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Chapter</span>
              <select
                value={noteData.chapter}
                onChange={e => setNoteData(prev => ({ ...prev, chapter: e.target.value }))}
                className="input-void select-void"
              >
                <option value="">Select chapter...</option>
                {noteChapters.map(ch => (
                  <option key={ch.name} value={ch.name}>{ch.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Notes Done %</span>
              <input
                type="number"
                min={0}
                max={100}
                value={noteData.notesProgress}
                onChange={e => setNoteData(prev => ({ ...prev, notesProgress: parseInt(e.target.value) || 0 }))}
                className="input-void text-center font-mono"
              />
            </label>
          </div>
          <label className="block">
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Note / Status</span>
            <input
              type="text"
              placeholder="e.g. finished derivations + examples"
              value={noteData.noteText}
              onChange={e => setNoteData(prev => ({ ...prev, noteText: e.target.value }))}
              className="input-void"
            />
          </label>
          <button type="submit" className="btn-neon w-full md:w-auto">Save Note Progress</button>
        </form>

        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {data.noteLogs.length === 0 ? (
            <p className="text-sm text-[var(--text-ghost)]">No notes logged yet.</p>
          ) : data.noteLogs.slice(0, 20).map((n) => (
            <div key={n.id} className="p-3 rounded-lg bg-[var(--void-surface)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 mb-1 text-xs text-[var(--text-muted)]">
                <span>{n.date}</span>
                <span>{n.subject}</span>
                <span>{n.chapter}</span>
              </div>
              <div className="text-sm text-[var(--text-primary)] mb-1">{n.noteText || '-'}</div>
              <div className="text-xs font-mono text-[var(--neon-green)]">{n.notesProgress}% notes done</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
