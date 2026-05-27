'use client'

import { useState } from 'react'
import { BookOpen, Plus, Clock, AlertTriangle, Check } from 'lucide-react'
import type { AppData, DoubtLog, ProgressLog, Subject, TipLog, NoteLog } from '@/lib/jee-os/types'

interface TrackerPageProps {
  data: AppData
  logProgress: (log: ProgressLog) => boolean
  addTipLog: (tip: TipLog) => boolean
  addNoteLog: (note: NoteLog) => boolean
  addDoubtLog: (doubt: DoubtLog) => boolean
}

export function TrackerPage({ data, logProgress, addTipLog, addNoteLog, addDoubtLog }: TrackerPageProps) {
  const [formData, setFormData] = useState({
    subject: 'Physics' as Subject,
    chapter: '',
    type: 'Exercise' as 'Exercise' | 'Step 2' | 'Step 3',
    rangeStart: 1,
    rangeEnd: 10,
    doubts: '',
    notes: '',
    flagged: false,
    step3Section: '',
    step3TotalInSection: 0
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
  const [doubtLogData, setDoubtLogData] = useState({
    subject: 'Physics' as Subject,
    chapter: '',
    doubtQuestion: '',
    resolved: false,
    note: ''
  })

  const chapters = data.subjects[formData.subject]
  const tipChapters = data.subjects[tipData.subject]
  const noteChapters = data.subjects[noteData.subject]
  const doubtLogChapters = data.subjects[doubtLogData.subject]

  const parseDoubts = (text: string): number[] => {
    if (!text.trim()) return []
    return [...new Set(
      text
        .split(',')
        .map(v => Number(v.trim()))
        .filter(n => Number.isInteger(n))
    )]
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const attempted = formData.rangeEnd - formData.rangeStart + 1
    const doubtList = parseDoubts(formData.doubts)
    // Auto-calculate solved: range size minus doubts
    const solved = attempted - doubtList.length

    // For Step 3: calculate the adjusted question number based on sections
    const chapter = data.subjects[formData.subject].find(c => c.name === formData.chapter)
    const existingSections = chapter?.step3Sections || {}

    let adjustedSolved = solved
    let adjustedRangeStart = formData.rangeStart
    let adjustedRangeEnd = formData.rangeEnd

    // If this is Step 3 and we have section info
    if (formData.type === 'Step 3' && formData.step3Section && chapter) {
      const sectionLetters = 'abcde'
      let previousTotal = 0
      for (let i = 0; i < sectionLetters.indexOf(formData.step3Section.toLowerCase()); i++) {
        const sec = sectionLetters[i]
        previousTotal += existingSections[sec] || 0
      }

      adjustedSolved = previousTotal + solved
      adjustedRangeStart = previousTotal + formData.rangeStart
      adjustedRangeEnd = previousTotal + formData.rangeEnd
    }

    const log: ProgressLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      subject: formData.subject,
      chapter: formData.chapter,
      type: formData.type,
      rangeStart: adjustedRangeStart,
      rangeEnd: adjustedRangeEnd,
      solved: adjustedSolved,
      correct: solved,
      attempted,
      left: doubtList.length,
      doubts: formData.doubts,
      doubtList: doubtList,
      notes: formData.notes,
      flagged: formData.flagged || doubtList.length > 0,
      step3Section: formData.type === 'Step 3' ? formData.step3Section : undefined,
      step3Question: formData.type === 'Step 3' ? solved : undefined,
      step3TotalInSection: formData.type === 'Step 3' ? formData.step3TotalInSection : undefined
    }

    const ok = logProgress(log)
    if (!ok) return

    setFormData(prev => ({
      ...prev,
      rangeStart: prev.rangeEnd + 1,
      rangeEnd: prev.rangeEnd + 10,
      doubts: '',
      notes: '',
      flagged: false,
      step3Section: '',
      step3TotalInSection: 0
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

  const handleDoubtLogSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const doubt: DoubtLog = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      subject: doubtLogData.subject,
      chapter: doubtLogData.chapter,
      doubtQuestion: doubtLogData.doubtQuestion.trim(),
      resolved: doubtLogData.resolved,
      note: doubtLogData.note.trim()
    }
    const ok = addDoubtLog(doubt)
    if (!ok) return
    setDoubtLogData(prev => ({ ...prev, doubtQuestion: '', resolved: false, note: '' }))
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

      {/* Progress History - moved to top with fixed height */}
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
          <div className="max-h-[300px] overflow-y-auto">
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
                {data.progressLogs.map(log => (
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

      {/* Log Progress */}
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
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Attempted</span>
              <input
                type="number"
                min={1}
                value={formData.rangeEnd - formData.rangeStart + 1}
                readOnly
                className="input-void text-center font-mono opacity-50 cursor-not-allowed"
              />
            </label>
          </div>

          {formData.type === 'Step 3' && (
            <div className="grid grid-cols-3 gap-4">
              <label className="block">
                <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Section</span>
                <input
                  type="text"
                  maxLength={1}
                  placeholder="A"
                  value={formData.step3Section}
                  onChange={e => setFormData(prev => ({ ...prev, step3Section: e.target.value.toLowerCase() }))}
                  className="input-void text-center font-mono"
                />
              </label>

              <label className="block">
                <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Total in Section</span>
                <input
                  type="number"
                  min={1}
                  value={formData.step3TotalInSection}
                  onChange={e => setFormData(prev => ({ ...prev, step3TotalInSection: parseInt(e.target.value) || 0 }))}
                  className="input-void text-center font-mono"
                />
              </label>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Doubt Questions</span>
              <input
                type="text"
                placeholder="e.g. 8,12,19 (auto-calculates solved)"
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

      {/* Tip Log */}
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

      {/* Doubt Log */}
      <div className="glass-card p-6 animate-entrance animate-entrance-4">
        <div className="flex items-center gap-2 mb-6">
          <AlertTriangle className="w-4 h-4 text-[var(--neon-amber)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Doubt Log</span>
        </div>

        <form onSubmit={handleDoubtLogSubmit} className="space-y-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Subject</span>
              <select
                value={doubtLogData.subject}
                onChange={e => setDoubtLogData(prev => ({ ...prev, subject: e.target.value as Subject, chapter: '' }))}
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
                value={doubtLogData.chapter}
                onChange={e => setDoubtLogData(prev => ({ ...prev, chapter: e.target.value }))}
                className="input-void select-void"
              >
                <option value="">Select chapter...</option>
                {doubtLogChapters.map(ch => (
                  <option key={ch.name} value={ch.name}>{ch.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Question #</span>
              <input
                type="text"
                placeholder="e.g. 17"
                value={doubtLogData.doubtQuestion}
                onChange={e => setDoubtLogData(prev => ({ ...prev, doubtQuestion: e.target.value }))}
                className="input-void font-mono"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Resolved?</span>
              <select
                value={doubtLogData.resolved ? '1' : '0'}
                onChange={e => setDoubtLogData(prev => ({ ...prev, resolved: e.target.value === '1' }))}
                className="input-void select-void"
              >
                <option value="0">No (Doubt)</option>
                <option value="1">Yes (Hard Question)</option>
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Note</span>
            <input
              type="text"
              placeholder="Any note about this doubt..."
              value={doubtLogData.note}
              onChange={e => setDoubtLogData(prev => ({ ...prev, note: e.target.value }))}
              className="input-void"
            />
          </label>

          <button type="submit" className="btn-neon w-full md:w-auto">Save Doubt Log</button>
        </form>

        <div className="space-y-3 max-h-[280px] overflow-y-auto">
          {'doubtLogs' in data && data.doubtLogs && data.doubtLogs.length > 0 
            ? data.doubtLogs.slice(0, 20).map((d) => (
              <div key={d.id} className="p-3 rounded-lg bg-[var(--void-surface)] border border-[var(--border-subtle)]">
                <div className="flex items-center gap-2 mb-1 text-xs text-[var(--text-muted)]">
                  <span>{d.date}</span>
                  <span>{d.subject}</span>
                  <span>{d.chapter}</span>
                  <span>Q{d.doubtQuestion}</span>
                  {d.resolved && <Check className="w-3 h-3 text-[var(--neon-green)]" />}
                </div>
                <div className="text-sm text-[var(--text-primary)]">{d.note || '-'}</div>
              </div>
            ))
            : <p className="text-sm text-[var(--text-ghost)]">No doubt logs saved yet.</p>
          }
        </div>
      </div>

      {/* Note Log */}
      <div className="glass-card p-6 animate-entrance animate-entrance-5">
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