'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronRight, Sparkles } from 'lucide-react'
import type { AppData, Subject } from '@/lib/jee-os/types'

interface ChapterRadarStripProps {
  data: AppData
}

const SUBJECT_META: Record<Subject, { accent: string; label: string }> = {
  Physics: { accent: '#a855f7', label: 'Physics' },
  Chemistry: { accent: '#22d3ee', label: 'Chemistry' },
  Mathematics: { accent: '#f472b6', label: 'Mathematics' }
}

function ChapterRail({ subject, chapters }: { subject: Subject; chapters: AppData['subjects'][Subject] }) {
  const railRef = useRef<HTMLDivElement | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const lastTickRef = useRef(0)
  const [leftFade, setLeftFade] = useState(0)
  const [rightFade, setRightFade] = useState(1)

  useEffect(() => {
    const rail = railRef.current
    if (!rail) return

    const updateFade = () => {
      const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth)
      if (maxScroll <= 2) {
        setLeftFade(0)
        setRightFade(0)
        return
      }

      setLeftFade(Math.min(1, rail.scrollLeft / 48))
      setRightFade(Math.min(1, (maxScroll - rail.scrollLeft) / 48))
    }

    const playTick = () => {
      const now = Date.now()
      if (now - lastTickRef.current < 60) return
      lastTickRef.current = now

      const AudioCtx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!AudioCtx) return

      if (!audioRef.current) {
        audioRef.current = new AudioCtx()
      }

      const ctx = audioRef.current
      if (!ctx || ctx.state === 'closed') return
      if (ctx.state === 'suspended') {
        void ctx.resume()
      }

      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'square'
      osc.frequency.setValueAtTime(780, ctx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(620, ctx.currentTime + 0.02)
      gain.gain.setValueAtTime(0.0001, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.025, ctx.currentTime + 0.004)
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 0.045)
    }

    updateFade()
    rail.addEventListener('scroll', updateFade, { passive: true })
    rail.addEventListener('wheel', playTick, { passive: true })
    window.addEventListener('resize', updateFade)

    return () => {
      rail.removeEventListener('scroll', updateFade)
      rail.removeEventListener('wheel', playTick)
      window.removeEventListener('resize', updateFade)
    }
  }, [])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: SUBJECT_META[subject].accent, boxShadow: `0 0 18px ${SUBJECT_META[subject].accent}` }} />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{SUBJECT_META[subject].label}</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]">
          {chapters.length} chapters
        </span>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16"
          style={{
            opacity: leftFade,
            background: 'linear-gradient(to right, var(--void) 0%, rgba(3,5,8,0) 100%)'
          }}
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16"
          style={{
            opacity: rightFade,
            background: 'linear-gradient(to left, var(--void) 0%, rgba(3,5,8,0) 100%)'
          }}
        />

        <div
          ref={railRef}
          className="flex gap-4 overflow-x-auto pb-3 pr-6 cyber-scroll scroll-smooth"
        >
          {chapters.length === 0 ? (
            <div className="glass-card min-w-[240px] p-5 text-sm text-[var(--text-muted)]">
              Add chapters in Settings to unlock this rail.
            </div>
          ) : (
            chapters.map((chapter) => {
              const total = chapter.exerciseTotal + chapter.step2Total + chapter.step3Total
              const done = chapter.exerciseDone + chapter.step2Done + chapter.step3Done
              const progress = total > 0 ? Math.round((done / total) * 100) : 0
              const noteProgress = Math.max(0, Math.min(100, chapter.notesProgress || 0))
              const revisionGlow = chapter.revisionCount > 0 || chapter.doubts.length > 0

              return (
                <article
                  key={chapter.name}
                  className="glass-card group min-w-[240px] max-w-[240px] p-5 transition-all duration-300 hover:-translate-y-1.5 hover:border-[rgba(255,255,255,0.12)]"
                  style={{
                    boxShadow: revisionGlow
                      ? `0 0 0 1px rgba(255,255,255,0.06), 0 18px 36px rgba(0,0,0,0.35), 0 0 32px ${SUBJECT_META[subject].accent}22`
                      : undefined
                  }}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{chapter.name}</h3>
                      <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                        {revisionGlow ? 'Needs attention' : 'Stable'}
                      </p>
                    </div>
                    <span
                      className="rounded-md px-2 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-[#030508]"
                      style={{ backgroundColor: SUBJECT_META[subject].accent }}
                    >
                      {progress}%
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                        <span>Questions</span>
                        <span>{done}/{total || 0}</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${progress}%`, backgroundColor: SUBJECT_META[subject].accent }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-[var(--text-muted)]">
                        <span>Notes</span>
                        <span>{noteProgress}%</span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${noteProgress}%`, backgroundColor: SUBJECT_META[subject].accent, opacity: 0.75 }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--text-muted)]">
                      <span>{chapter.doubts.length} doubts</span>
                      <span>{chapter.revisionCount} revisions</span>
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}

export function ChapterRadarStrip({ data }: ChapterRadarStripProps) {
  const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics']

  return (
    <section className="glass-card p-6">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--neon-cyan)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.36em] text-[var(--text-muted)]">
              Chapter Radar
            </span>
          </div>
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Scroll through chapter health</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <ChevronRight className="h-4 w-4" />
          <span>Edge fade and scroll ticks are active</span>
        </div>
      </div>

      <div className="space-y-7">
        {subjects.map((subject) => (
          <ChapterRail key={subject} subject={subject} chapters={data.subjects[subject]} />
        ))}
      </div>
    </section>
  )
}
