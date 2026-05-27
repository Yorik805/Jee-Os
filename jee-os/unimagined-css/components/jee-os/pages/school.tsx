'use client'

import { useState } from 'react'
import { School, Zap, TrendingUp } from 'lucide-react'
import type { AppData, Subject } from '@/lib/jee-os/types'

interface SchoolPageProps {
  data: AppData
  updateSchoolProgress: (subject: Subject, chapter: string, index: number) => void
}

export function SchoolPage({ data, updateSchoolProgress }: SchoolPageProps) {
  const [formData, setFormData] = useState({
    subject: 'Physics' as Subject,
    chapter: '',
    index: 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateSchoolProgress(formData.subject, formData.chapter, formData.index)
  }

  const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics']

  return (
    <div className="space-y-6 animate-entrance">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-amber)] to-[#f59e0b] flex items-center justify-center">
            <School className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              School vs You
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Track if you are ahead or behind</p>
          </div>
        </div>
      </div>

      {/* Update Form */}
      <div className="glass-card p-6 animate-entrance animate-entrance-1">
        <div className="flex items-center gap-2 mb-6">
          <Zap className="w-4 h-4 text-[var(--neon-amber)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Update School Position</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Subject</span>
              <select
                value={formData.subject}
                onChange={e => setFormData(prev => ({ ...prev, subject: e.target.value as Subject }))}
                className="input-void select-void"
              >
                <option>Physics</option>
                <option>Chemistry</option>
                <option>Mathematics</option>
              </select>
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Current Chapter</span>
              <input
                type="text"
                placeholder="Chapter name..."
                value={formData.chapter}
                onChange={e => setFormData(prev => ({ ...prev, chapter: e.target.value }))}
                className="input-void"
              />
            </label>

            <label className="block">
              <span className="text-[10px] font-bold tracking-widest text-[var(--text-muted)] uppercase block mb-2">Chapter Index</span>
              <input
                type="number"
                min={1}
                value={formData.index}
                onChange={e => setFormData(prev => ({ ...prev, index: parseInt(e.target.value) || 1 }))}
                className="input-void font-mono"
              />
            </label>
          </div>

          <button type="submit" className="btn-neon">
            Update
          </button>
        </form>
      </div>

      {/* Race Cards */}
      <div className="space-y-4 stagger-children">
        {subjects.map((subject, i) => {
          const schoolProgress = data.schoolProgress[subject]
          const yourChapters = data.subjects[subject].length
          const chaptersWithProgress = data.subjects[subject].filter(ch => {
            return data.progressLogs.some(
              log => log.subject === subject && log.chapter === ch.name
            )
          }).length

          const schoolPosition = schoolProgress.index
          const yourPosition = chaptersWithProgress

          const maxPosition = Math.max(schoolPosition, yourPosition, yourChapters, 1)
          const schoolPercent = (schoolPosition / maxPosition) * 100
          const yourPercent = (yourPosition / maxPosition) * 100

          const colors = ['purple', 'cyan', 'pink'] as const
          const colorStyle = {
            purple: { bar: 'bg-[var(--neon-purple)]', text: 'text-[var(--neon-purple)]' },
            cyan: { bar: 'bg-[var(--neon-cyan)]', text: 'text-[var(--neon-cyan)]' },
            pink: { bar: 'bg-[var(--neon-pink)]', text: 'text-[var(--neon-pink)]' }
          }[colors[i]]

          const status = yourPosition > schoolPosition ? 'AHEAD' 
            : yourPosition < schoolPosition ? 'BEHIND' 
            : 'ON TRACK'

          return (
            <div key={subject} className="glass-card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className={`w-4 h-4 ${colorStyle.text}`} />
                  <span className="font-semibold text-[var(--text-primary)]">{subject}</span>
                </div>
                <span className={`tag-void ${
                  status === 'AHEAD' ? 'tag-green' : 
                  status === 'BEHIND' ? 'tag-red' : 'tag-amber'
                }`}>
                  {status}
                </span>
              </div>

              <div className="space-y-3">
                {/* Your Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">You</span>
                    <span className={`font-mono ${colorStyle.text}`}>Ch. {yourPosition}</span>
                  </div>
                  <div className="h-8 bg-[var(--void-surface)] rounded-lg relative overflow-hidden">
                    <div 
                      className={`h-full ${colorStyle.bar} transition-all duration-700 flex items-center justify-end pr-3`}
                      style={{ width: `${Math.max(yourPercent, 5)}%` }}
                    >
                      <span className="text-xs font-bold text-white">YOU</span>
                    </div>
                  </div>
                </div>

                {/* School Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[var(--text-muted)]">School</span>
                    <span className="font-mono text-[var(--neon-amber)]">Ch. {schoolPosition}</span>
                  </div>
                  <div className="h-8 bg-[var(--void-surface)] rounded-lg relative overflow-hidden">
                    <div 
                      className="h-full bg-[var(--neon-amber)] transition-all duration-700 flex items-center justify-end pr-3"
                      style={{ width: `${Math.max(schoolPercent, 5)}%` }}
                    >
                      <span className="text-xs font-bold text-[var(--void)]">SCHOOL</span>
                    </div>
                  </div>
                </div>

                {schoolProgress.chapter && (
                  <p className="text-xs text-[var(--text-ghost)] mt-2">
                    School currently at: <span className="text-[var(--text-muted)]">{schoolProgress.chapter}</span>
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
