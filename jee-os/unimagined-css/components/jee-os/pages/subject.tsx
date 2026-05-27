'use client'

import { useState } from 'react'
import { Atom, FlaskConical, Calculator, BookCheck, TrendingUp, Edit2, Trash2, X } from 'lucide-react'
import type { AppData, Subject, Chapter } from '@/lib/jee-os/types'

interface SubjectPageProps {
  subject: Subject
  data: AppData
  color: 'purple' | 'cyan' | 'pink'
  editChapter?: (subject: Subject, oldName: string, updatedChapter: Chapter) => void
  deleteChapter?: (subject: Subject, chapterName: string) => void
}

export function SubjectPage({ subject, data, color, editChapter, deleteChapter }: SubjectPageProps) {
  const chapters = data.subjects[subject]
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null)
  
  const icons = {
    Physics: Atom,
    Chemistry: FlaskConical,
    Mathematics: Calculator
  }
  const Icon = icons[subject]

  const colors = {
    purple: {
      gradient: 'from-[var(--neon-purple)] to-[#9333ea]',
      text: 'text-[var(--neon-purple)]',
      bar: 'progress-purple',
      tag: 'tag-purple',
      accent: 'var(--neon-purple)'
    },
    cyan: {
      gradient: 'from-[var(--neon-cyan)] to-[#06b6d4]',
      text: 'text-[var(--neon-cyan)]',
      bar: 'progress-cyan',
      tag: 'tag-cyan',
      accent: 'var(--neon-cyan)'
    },
    pink: {
      gradient: 'from-[var(--neon-pink)] to-[#ec4899]',
      text: 'text-[var(--neon-pink)]',
      bar: 'progress-pink',
      tag: 'tag-pink',
      accent: 'var(--neon-pink)'
    }
  }

  const colorStyle = colors[color]

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter)
  }

  const handleDelete = (chapterName: string) => {
    if (confirm(`Delete chapter "${chapterName}"?`) && deleteChapter) {
      deleteChapter(subject, chapterName)
    }
  }

  const closeModal = () => setEditingChapter(null)

  // Calculate stats
  const totalChapters = chapters.length
  const excludeStep3 = data.settings?.excludeStep3FromCalculations ?? false

  const avgCompletion = chapters.length > 0
    ? chapters.reduce((sum, ch) => {
        const logs = data.progressLogs.filter(
          log => log.subject === subject && log.chapter === ch.name
        )
        let totalQuestions = ch.exerciseTotal + ch.step2Total + ch.step3Total
        let solvedQuestions = logs.reduce((s, l) => {
          if (excludeStep3 && l.type === 'Step 3') return s
          const count = l.type === 'Step 3' && l.step3Question ? l.step3Question : l.solved
          return s + count
        }, 0)
        if (excludeStep3) {
          totalQuestions = ch.exerciseTotal + ch.step2Total
        }
        return sum + (totalQuestions > 0 ? (solvedQuestions / totalQuestions) * 100 : 0)
      }, 0) / chapters.length
    : 0

  return (
    <div className="space-y-6 animate-entrance">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorStyle.gradient} flex items-center justify-center`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              {subject}
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Chapter-wise breakdown</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookCheck className={`w-4 h-4 ${colorStyle.text}`} />
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Total Chapters</span>
          </div>
          <div className={`text-3xl font-bold ${colorStyle.text}`}>{totalChapters}</div>
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className={`w-4 h-4 ${colorStyle.text}`} />
            <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase">Avg Completion</span>
          </div>
          <div className={`text-3xl font-bold ${colorStyle.text}`}>{avgCompletion.toFixed(0)}%</div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="glass-card p-6 animate-entrance animate-entrance-1">
        <div className="flex items-center gap-2 mb-6">
          <Icon className={`w-4 h-4 ${colorStyle.text}`} />
          <span className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase">Chapters</span>
        </div>

        {chapters.length === 0 ? (
          <div className="text-center py-12 text-[var(--text-ghost)]">
            <BookCheck className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No chapters added yet</p>
            <p className="text-sm mt-1">Add chapters in Settings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {chapters.map(chapter => {
              const logs = data.progressLogs.filter(
                log => log.subject === subject && log.chapter === chapter.name
              )
              
              const exerciseSolved = logs
                .filter(l => l.type === 'Exercise')
                .reduce((sum, l) => sum + l.solved, 0)
              const step2Solved = logs
                .filter(l => l.type === 'Step 2')
                .reduce((sum, l) => sum + l.solved, 0)
              const step3Solved = logs
                .filter(l => l.type === 'Step 3')
                .reduce((sum, l) => sum + (l.step3Question ?? l.solved), 0)

              const exerciseProgress = chapter.exerciseTotal > 0 
                ? (exerciseSolved / chapter.exerciseTotal) * 100 : 0
              const step2Progress = chapter.step2Total > 0 
                ? (step2Solved / chapter.step2Total) * 100 : 0
              const step3Progress = chapter.step3Total > 0 
                ? (step3Solved / chapter.step3Total) * 100 : 0

              // For display, if excludeStep3, show total without Step 3
              const displayTotal = excludeStep3 
                ? exerciseSolved + step2Solved 
                : exerciseSolved + step2Solved + step3Solved
              const displayMax = excludeStep3
                ? chapter.exerciseTotal + chapter.step2Total
                : chapter.exerciseTotal + chapter.step2Total + chapter.step3Total

              return (
                <div 
                  key={chapter.name}
                  className="p-4 rounded-xl bg-[var(--void-surface)] border border-[var(--border-subtle)] hover:border-[var(--border-dim)] transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)]">{chapter.name}</h3>
                      {chapter.notes && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">{chapter.notes}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`tag-void ${colorStyle.tag}`}>
                        {logs.length} sessions
                      </span>
                      {editChapter && (
                        <>
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="p-1.5 rounded-lg hover:bg-[var(--void-elevated)] transition-colors"
                            title="Edit chapter"
                          >
                            <Edit2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                          </button>
                          <button
                            onClick={() => handleDelete(chapter.name)}
                            className="p-1.5 rounded-lg hover:bg-[var(--neon-red)]/10 transition-colors"
                            title="Delete chapter"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[var(--neon-red)]" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--text-ghost)] uppercase tracking-wide mb-1">
                        <span>Exercise</span>
                        <span>{exerciseSolved}/{chapter.exerciseTotal}</span>
                      </div>
                      <div className="h-1.5 bg-[var(--void-elevated)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colorStyle.bar} transition-all`}
                          style={{ width: `${exerciseProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--text-ghost)] uppercase tracking-wide mb-1">
                        <span>Step 2</span>
                        <span>{step2Solved}/{chapter.step2Total}</span>
                      </div>
                      <div className="h-1.5 bg-[var(--void-elevated)] rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${colorStyle.bar} transition-all`}
                          style={{ width: `${step2Progress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[10px] text-[var(--text-ghost)] uppercase tracking-wide mb-1">
                        <span>Step 3</span>
                        <span>{step3Solved}/{chapter.step3Total}</span>
                      </div>
                      <div className={`h-1.5 bg-[var(--void-elevated)] rounded-full overflow-hidden ${
                        excludeStep3 ? 'opacity-50' : ''
                      }`}>
                        <div 
                          className={`h-full ${colorStyle.bar} transition-all`}
                          style={{ width: `${step3Progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="glass-card p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[var(--text-primary)]">Edit Chapter</h2>
              <button onClick={closeModal} className="p-1 rounded-lg hover:bg-[var(--void-elevated)]">
                <X className="w-4 h-4 text-[var(--text-muted)]" />
              </button>
            </div>
            
            <EditChapterForm 
              subject={subject}
              chapter={editingChapter}
              onSave={(updatedChapter) => {
                if (editChapter) {
                  editChapter(subject, editingChapter.name, updatedChapter)
                }
                closeModal()
              }}
              onCancel={closeModal}
              color={color}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface EditChapterFormProps {
  subject: Subject
  chapter: Chapter
  onSave: (chapter: Chapter) => void
  onCancel: () => void
  color: 'purple' | 'cyan' | 'pink'
}

function EditChapterForm({ subject, chapter, onSave, onCancel, color }: EditChapterFormProps) {
  const [editForm, setEditForm] = useState({
    name: chapter.name,
    notes: chapter.notes,
    exerciseTotal: chapter.exerciseTotal,
    step2Total: chapter.step2Total,
    step3Total: chapter.step3Total
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...chapter,
      name: editForm.name.trim(),
      notes: editForm.notes.trim(),
      exerciseTotal: editForm.exerciseTotal,
      step2Total: editForm.step2Total,
      step3Total: editForm.step3Total,
      step3Sections: chapter.step3Sections || {}
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Chapter Name</span>
        <input
          type="text"
          value={editForm.name}
          onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
          className="input-void w-full"
          required
        />
      </label>

      <label className="block">
        <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Notes</span>
        <input
          type="text"
          value={editForm.notes}
          onChange={e => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
          className="input-void w-full"
          placeholder="Optional notes..."
        />
      </label>

      <div className="grid grid-cols-3 gap-3">
        <label className="block">
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Exercise</span>
          <input
            type="number"
            min={0}
            value={editForm.exerciseTotal}
            onChange={e => setEditForm(prev => ({ ...prev, exerciseTotal: parseInt(e.target.value) || 0 }))}
            className="input-void w-full font-mono"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Step 2</span>
          <input
            type="number"
            min={0}
            value={editForm.step2Total}
            onChange={e => setEditForm(prev => ({ ...prev, step2Total: parseInt(e.target.value) || 0 }))}
            className="input-void w-full font-mono"
          />
        </label>

        <label className="block">
          <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Step 3</span>
          <input
            type="number"
            min={0}
            value={editForm.step3Total}
            onChange={e => setEditForm(prev => ({ ...prev, step3Total: parseInt(e.target.value) || 0 }))}
            className="input-void w-full font-mono"
          />
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" className="btn-neon flex-1">Save</button>
        <button type="button" onClick={onCancel} className="btn-neon btn-ghost">Cancel</button>
      </div>
    </form>
  )
}