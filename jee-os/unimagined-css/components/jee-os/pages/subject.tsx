'use client'

import { Atom, FlaskConical, Calculator, BookCheck, TrendingUp } from 'lucide-react'
import type { AppData, Subject } from '@/lib/jee-os/types'

interface SubjectPageProps {
  subject: Subject
  data: AppData
  color: 'purple' | 'cyan' | 'pink'
}

export function SubjectPage({ subject, data, color }: SubjectPageProps) {
  const chapters = data.subjects[subject]
  
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
      tag: 'tag-purple'
    },
    cyan: {
      gradient: 'from-[var(--neon-cyan)] to-[#06b6d4]',
      text: 'text-[var(--neon-cyan)]',
      bar: 'progress-cyan',
      tag: 'tag-cyan'
    },
    pink: {
      gradient: 'from-[var(--neon-pink)] to-[#ec4899]',
      text: 'text-[var(--neon-pink)]',
      bar: 'progress-pink',
      tag: 'tag-pink'
    }
  }

  const colorStyle = colors[color]

  // Calculate stats
  const totalChapters = chapters.length
  const avgCompletion = chapters.length > 0
    ? chapters.reduce((sum, ch) => {
        const logs = data.progressLogs.filter(
          log => log.subject === subject && log.chapter === ch.name
        )
        const totalQuestions = ch.exerciseTotal + ch.step2Total + ch.step3Total
        const solvedQuestions = logs.reduce((s, l) => s + l.solved, 0)
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
                .reduce((sum, l) => sum + l.solved, 0)

              const exerciseProgress = chapter.exerciseTotal > 0 
                ? (exerciseSolved / chapter.exerciseTotal) * 100 : 0
              const step2Progress = chapter.step2Total > 0 
                ? (step2Solved / chapter.step2Total) * 100 : 0
              const step3Progress = chapter.step3Total > 0 
                ? (step3Solved / chapter.step3Total) * 100 : 0

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
                    <span className={`tag-void ${colorStyle.tag}`}>
                      {logs.length} sessions
                    </span>
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
                      <div className="h-1.5 bg-[var(--void-elevated)] rounded-full overflow-hidden">
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
    </div>
  )
}
