
// Backup of chapter-radar-strip.tsx before temporary replacement


import { useEffect, useRef, useState, useCallback } from 'react'
import { Sparkles, ChevronRight } from 'lucide-react'
import type { AppData, Subject } from '@/lib/jee-os/types'
import { SubjectAveragesChart } from '../components/subject-averages-chart'

interface ChapterRadarStripProps {
  data: AppData
}

const SUBJECT_META: Record<Subject, { accent: string; label: string }> = {
  Physics:     { accent: '#a855f7', label: 'Physics' },
  Chemistry:   { accent: '#22d3ee', label: 'Chemistry' },
  Mathematics: { accent: '#f472b6', label: 'Mathematics' },
}

const CARD_W  = 260
const CARD_G  = 32
const STEP    = CARD_W + CARD_G

// mobile: active full, side cards peek from slightly below
const M_STEP    = CARD_W * 0.68
const M_SINK    = 20   // px lower than active
const M_SCALE   = 0.88
const M_OPACITY = 0.55

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `${r},${g},${b}`
}

function playClick(audioRef: React.MutableRefObject<AudioContext | null>, lastRef: React.MutableRefObject<number>) {
  const now = Date.now()
  if (now - lastRef.current < 80) return
  lastRef.current = now
  try {
    const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return
    if (!audioRef.current) audioRef.current = new AC()
    const ctx = audioRef.current
    if (!ctx || ctx.state === 'closed') return
    if (ctx.state === 'suspended') void ctx.resume()

    // noise burst (thock)
    const buf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.03), ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.18, ctx.currentTime)
    ng.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.028)
    const f = ctx.createBiquadFilter()
    f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.8
    noise.connect(f); f.connect(ng); ng.connect(ctx.destination)
    noise.start(); noise.stop(ctx.currentTime + 0.03)

    // body tone
    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(280, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.018)
    og.gain.setValueAtTime(0.06, ctx.currentTime)
    og.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.022)
    osc.connect(og); og.connect(ctx.destination)
    osc.start(); osc.stop(ctx.currentTime + 0.025)
  } catch (_) {}
}

function ChapterRail({ subject, chapters }: { subject: Subject; chapters: AppData['subjects'][Subject] }) {
  const [active, setActive]   = useState(0)
  const audioRef   = useRef<AudioContext | null>(null)
  const lastRef    = useRef(0)
  const dragStart  = useRef<number | null>(null)
  const dragX      = useRef(0)
  const dragging   = useRef(false)
  const hovered    = useRef(false)
  const trackRef   = useRef<HTMLDivElement | null>(null)

  const accent    = SUBJECT_META[subject].accent
  const rgb       = hexToRgb(accent)

  const goTo = useCallback((idx: number) => {
    const c = Math.max(0, Math.min(chapters.length - 1, idx))
    setActive(prev => {
      if (c === prev) return prev
      playClick(audioRef, lastRef)
      return c
    })
  }, [chapters.length])

  // drag
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (dragStart.current === null) return
      dragX.current = e.clientX
      if (Math.abs(e.clientX - dragStart.current) > 6) dragging.current = true
    }
    const onUp = () => {
      if (dragStart.current === null) return
      const diff = dragX.current - dragStart.current
      if (Math.abs(diff) > 40) goTo(diff < 0 ? active + 1 : active - 1)
      dragStart.current = null
      setTimeout(() => { dragging.current = false }, 10)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp) }
  }, [active, goTo])

  // wheel — captured only when hovered
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      if (!hovered.current) return
      e.preventDefault()
      goTo((e.deltaY > 0 || e.deltaX > 0) ? active + 1 : active - 1)
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [active, goTo])

  if (chapters.length === 0) {
    return <div className="glass-card p-5 text-sm text-[var(--text-muted)]">Add chapters in Settings to unlock this rail.</div>
  }

  return (
    <div className="space-y-3">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 18px ${accent}` }} />
          <span className="text-sm font-semibold text-[var(--text-primary)]">{SUBJECT_META[subject].label}</span>
        </div>
        <span className="text-[10px] uppercase tracking-[0.32em] text-[var(--text-muted)]">{chapters.length} chapters</span>
      </div>

      {/* track */}
      <div
        ref={trackRef}
        className="relative overflow-hidden"
        style={{ height: 320, userSelect: 'none', WebkitUserSelect: 'none' as const, cursor: 'grab' }}
        onMouseEnter={() => { hovered.current = true }}
        onMouseLeave={() => { hovered.current = false }}
        onMouseDown={e => { e.preventDefault(); dragging.current = false; dragStart.current = e.clientX; dragX.current = e.clientX }}
        onTouchStart={e => { dragging.current = false; dragStart.current = e.touches[0].clientX; dragX.current = e.touches[0].clientX }}
        onTouchMove={e => { dragX.current = e.touches[0].clientX; if (Math.abs(dragX.current - (dragStart.current ?? 0)) > 6) dragging.current = true }}
        onTouchEnd={() => {
          if (dragStart.current === null) return
          const diff = dragX.current - dragStart.current
          if (Math.abs(diff) > 40) goTo(diff < 0 ? active + 1 : active - 1)
          dragStart.current = null
          setTimeout(() => { dragging.current = false }, 10)
        }}
      >
        {chapters.map((chapter, i) => {
          const offset = i - active
          const abs    = Math.abs(offset)
          if (abs > 3) return null

          const exProgress  = chapter.exerciseTotal > 0 ? Math.round((chapter.exerciseDone / chapter.exerciseTotal) * 100) : 0
          const s2Progress  = chapter.step2Total > 0 ? Math.round((chapter.step2Done / chapter.step2Total) * 100) : 0
          const s3Progress  = chapter.step3Total > 0 ? Math.round((chapter.step3Done / chapter.step3Total) * 100) : 0
          const overall     = Math.round((exProgress + s2Progress + s3Progress) / 3)
          const notes       = Math.max(0, Math.min(100, chapter.notesProgress || 0))
          const needsAttn   = chapter.revisionCount > 0 || chapter.doubts.length > 0
          const isActive    = abs === 0

          // desktop values
          const dTx      = offset * STEP
          const dScale   = isActive ? 1 : abs === 1 ? 0.90 : 0.80
          const dOpacity = isActive ? 1 : abs === 1 ? 0.50 : abs === 2 ? 0.22 : 0

          // mobile values
          const mTx      = offset * M_STEP
          const mTy      = isActive ? 0 : M_SINK
          const mScale   = isActive ? 1 : abs === 1 ? M_SCALE : 0
          const mOpacity = isActive ? 1 : abs === 1 ? M_OPACITY : 0

          return (
            <article
              key={chapter.name}
              onClick={() => { if (!dragging.current && !isActive) goTo(i) }}
              className="glass-card p-5 chapter-rail-card"
              data-offset={offset}
              style={{
                position: 'absolute',
                width: CARD_W,
                left: '50%',
                top: '50%',
                // CSS custom props so the @media block can override them
                ['--dtx' as string]: `${dTx}px`,
                ['--dscale' as string]: dScale,
                ['--dopacity' as string]: dOpacity,
                ['--mtx' as string]: `${mTx}px`,
                ['--mty' as string]: `${mTy}px`,
                ['--mscale' as string]: mScale,
                ['--mopacity' as string]: mOpacity,
                transform: `translateX(calc(-50% + var(--dtx))) translateY(-50%) scale(var(--dscale))`,
                opacity: dOpacity,
                zIndex: 10 - abs,
                cursor: isActive ? 'grab' : 'pointer',
                transition: 'transform 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.45s cubic-bezier(0.22,1,0.36,1), box-shadow 0.45s ease, border-color 0.45s ease',
                borderColor: isActive ? `rgba(${rgb},0.45)` : 'rgba(148,163,184,0.08)',
                boxShadow: isActive
                  ? `0 0 0 1px rgba(${rgb},0.2), 0 24px 48px rgba(0,0,0,0.6), 0 0 40px rgba(${rgb},0.18)`
                  : needsAttn
                  ? `0 0 0 1px rgba(255,255,255,0.04), 0 12px 24px rgba(0,0,0,0.35), 0 0 20px rgba(${rgb},0.1)`
                  : '0 8px 24px rgba(0,0,0,0.3)',
              }}
            >
              {/* Title and status */}
              <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-sm text-[#f1f5f9] tracking-wide">{chapter.name}</h3>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.28em] text-[#64748b]">
                    {needsAttn ? 'Needs attention' : 'Stable'}
                  </p>
                </div>
                {needsAttn && (
                  <span className="pulse-badge text-xs font-bold px-2 py-1 rounded-md" style={{ backgroundColor: accent, color: "#030508" }}>
                    !
                  </span>
                )}
              </div>

              {/* Large percentage display */}
              <div className="text-3xl font-bold mb-4 font-mono" style={{ color: accent }}>
                {overall}
                <span className="text-lg text-[#64748b] ml-1">%</span>
              </div>

              {/* Progress bars for Exercise, Step 2, Step 3 */}
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748b] uppercase tracking-wider">Exercise</span>
                    <span className="text-[#f1f5f9] font-mono">{exProgress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[#1e293b]/50">
                    <div 
                      className="h-full rounded-full progress-bar transition-all duration-500"
                      style={{ width: `${exProgress}%`, backgroundColor: accent, opacity: 0.5 }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748b] uppercase tracking-wider">Step 2</span>
                    <span className="text-[#f1f5f9] font-mono">{s2Progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[#1e293b]/50">
                    <div 
                      className="h-full rounded-full progress-bar transition-all duration-500"
                      style={{ width: `${s2Progress}%`, backgroundColor: accent, opacity: 0.7 }} 
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-[#64748b] uppercase tracking-wider">Step 3</span>
                    <span className="text-[#f1f5f9] font-mono">{s3Progress}%</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-[#1e293b]/50">
                    <div 
                      className="h-full rounded-full progress-bar transition-all duration-500"
                      style={{ width: `${s3Progress}%`, backgroundColor: accent }} 
                    />
                  </div>
                </div>
              </div>

              {/* Doubts section */}
              <div className="mt-4 pt-3 border-t border-[#1e293b]/50 flex items-center justify-between">
                <span className="text-xs text-[#64748b]">{chapter.doubts.length} doubts</span>
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(chapter.doubts.length, 5) }).map((_, idx) => (
                    <div 
                      key={idx} 
                      className="w-1.5 h-1.5 rounded-full" 
                      style={{ backgroundColor: accent, opacity: 0.5 + (idx * 0.1) }} 
                    />
                  ))}
                </div>
              </div>
            </article>
          )
        })}

        {/* mobile override — CSS vars set above, media query applies them */}
        <style>{`
          @media (max-width: 767px) {
            .chapter-rail-card {
              transform: translateX(calc(-50% + var(--mtx))) translateY(calc(-50% + var(--mty))) scale(var(--mscale)) !important;
              opacity: var(--mopacity) !important;
            }
          }
        `}</style>
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-1.5">
        {chapters.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            style={{
              width: i === active ? 18 : 5, height: 5,
              borderRadius: 3,
              background: i === active ? accent : `rgba(${rgb},0.25)`,
              boxShadow: i === active ? `0 0 8px ${accent}` : 'none',
              transition: 'all 0.35s cubic-bezier(0.22,1,0.36,1)',
              border: 'none', cursor: 'pointer', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  )
}

export function ChapterRadarStrip({ data }: ChapterRadarStripProps) {
  const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics']
  return (
    <>
      <section className="glass-card p-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[var(--neon-cyan)]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.36em] text-[var(--text-muted)]">Chapter Radar</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">Scroll through chapter health</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
            <ChevronRight className="h-4 w-4" />
            <span>Drag or scroll to navigate</span>
          </div>
        </div>
        <div className="space-y-7">
          {subjects.map(s => <ChapterRail key={s} subject={s} chapters={data.subjects[s]} />)}
        </div>
      </section>

      {/* Subject Averages Chart */}
      <div className="mt-8">
        <SubjectAveragesChart data={data} />
      </div>
    </>
  )
}