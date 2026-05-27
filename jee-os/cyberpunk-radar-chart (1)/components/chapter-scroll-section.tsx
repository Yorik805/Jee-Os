"use client"

import { useCallback, useEffect, useRef, useState } from "react"

const physicsChapters = [
  { name: "Mechanics", notes: 90, step2: 75, step3: 40, doubts: 3, flagged: true },
  { name: "Thermodynamics", notes: 60, step2: 30, step3: 10, doubts: 7, flagged: true },
  { name: "Optics", notes: 100, step2: 85, step3: 70, doubts: 1, flagged: false },
  { name: "Waves", notes: 80, step2: 60, step3: 35, doubts: 2, flagged: false },
  { name: "Electrostatics", notes: 70, step2: 50, step3: 25, doubts: 4, flagged: true },
  { name: "Magnetism", notes: 55, step2: 40, step3: 15, doubts: 5, flagged: true },
]

const chemistryChapters = [
  { name: "Organic", notes: 50, step2: 35, step3: 15, doubts: 8, flagged: true },
  { name: "Inorganic", notes: 70, step2: 55, step3: 30, doubts: 4, flagged: false },
  { name: "Physical", notes: 85, step2: 70, step3: 45, doubts: 3, flagged: false },
  { name: "Coordination", notes: 40, step2: 25, step3: 10, doubts: 6, flagged: true },
  { name: "Electrochemistry", notes: 75, step2: 60, step3: 35, doubts: 2, flagged: false },
]

const mathsChapters = [
  { name: "Calculus", notes: 65, step2: 50, step3: 25, doubts: 5, flagged: true },
  { name: "Algebra", notes: 80, step2: 65, step3: 40, doubts: 3, flagged: false },
  { name: "Coordinate", notes: 90, step2: 75, step3: 55, doubts: 2, flagged: false },
  { name: "Vectors", notes: 70, step2: 55, step3: 30, doubts: 4, flagged: true },
  { name: "Probability", notes: 85, step2: 70, step3: 45, doubts: 1, flagged: false },
  { name: "Trigonometry", notes: 95, step2: 80, step3: 60, doubts: 1, flagged: false },
]

type Chapter = {
  name: string
  notes: number
  step2: number
  step3: number
  doubts: number
  flagged: boolean
}

function ChapterCard({ chapter, accent, glowClass, index }: { chapter: Chapter; accent: string; glowClass: string; index: number }) {
  const overall = Math.round((chapter.notes + chapter.step2 + chapter.step3) / 3)
  
  return (
    <div 
      className={`min-w-[220px] glass-card rounded-xl p-5 flex-shrink-0 cursor-pointer fade-in ${glowClass}`}
      style={{ 
        animationDelay: `${index * 0.1}s`,
        borderColor: chapter.flagged ? accent : undefined 
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <h4 className="font-medium text-sm text-[#f1f5f9] tracking-wide">{chapter.name}</h4>
        {chapter.flagged && (
          <span 
            className="pulse-badge text-xs font-bold px-2 py-1 rounded-md"
            style={{ backgroundColor: accent, color: "#030508" }}
          >
            !
          </span>
        )}
      </div>
      
      <div className="text-3xl font-bold mb-4 font-mono" style={{ color: accent }}>
        {overall}
        <span className="text-lg text-[#64748b] ml-1">%</span>
      </div>
      
      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#64748b] uppercase tracking-wider">Notes</span>
            <span className="text-[#f1f5f9] font-mono">{chapter.notes}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#1e293b]/50">
            <div 
              className="h-full rounded-full progress-bar transition-all duration-500"
              style={{ width: `${chapter.notes}%`, backgroundColor: accent, opacity: 0.5 }} 
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#64748b] uppercase tracking-wider">Step 2</span>
            <span className="text-[#f1f5f9] font-mono">{chapter.step2}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#1e293b]/50">
            <div 
              className="h-full rounded-full progress-bar transition-all duration-500"
              style={{ width: `${chapter.step2}%`, backgroundColor: accent, opacity: 0.7 }} 
            />
          </div>
        </div>
        
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-[#64748b] uppercase tracking-wider">Step 3</span>
            <span className="text-[#f1f5f9] font-mono">{chapter.step3}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-[#1e293b]/50">
            <div 
              className="h-full rounded-full progress-bar transition-all duration-500"
              style={{ width: `${chapter.step3}%`, backgroundColor: accent }} 
            />
          </div>
        </div>
      </div>
      
      {chapter.doubts > 0 && (
        <div className="mt-4 pt-3 border-t border-[#1e293b]/50 flex items-center justify-between">
          <span className="text-xs text-[#64748b]">{chapter.doubts} doubts</span>
          <div className="flex gap-1">
            {Array.from({ length: Math.min(chapter.doubts, 5) }).map((_, i) => (
              <div 
                key={i} 
                className="w-1.5 h-1.5 rounded-full" 
                style={{ backgroundColor: accent, opacity: 0.5 + (i * 0.1) }} 
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SubjectRow({ title, chapters, accent, glowClass }: { title: string; chapters: Chapter[]; accent: string; glowClass: string }) {
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const lastTickRef = useRef(0)
  const [leftFade, setLeftFade] = useState(0)
  const [rightFade, setRightFade] = useState(1)

  const updateFades = useCallback(() => {
    const el = scrollRef.current
    if (!el) return

    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
    if (maxScroll <= 2) {
      setLeftFade(0)
      setRightFade(0)
      return
    }

    const leftRatio = Math.min(1, el.scrollLeft / 48)
    const rightRemaining = maxScroll - el.scrollLeft
    const rightRatio = Math.min(1, rightRemaining / 48)

    setLeftFade(leftRatio)
    setRightFade(rightRatio)
  }, [])

  const playScrollTick = useCallback(() => {
    const now = Date.now()
    if (now - lastTickRef.current < 55) return
    lastTickRef.current = now

    if (typeof window === "undefined") return
    const AudioCtx = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioCtx) return

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx()
    }
    const ctx = audioContextRef.current
    if (!ctx || ctx.state === "closed") return
    if (ctx.state === "suspended") {
      void ctx.resume()
    }

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "square"
    osc.frequency.value = 850
    gain.gain.value = 0.0001
    gain.gain.exponentialRampToValueAtTime(0.03, ctx.currentTime + 0.004)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.035)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.04)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return

    updateFades()
    const onScroll = () => updateFades()
    const onWheel = () => playScrollTick()
    el.addEventListener("scroll", onScroll, { passive: true })
    el.addEventListener("wheel", onWheel, { passive: true })
    window.addEventListener("resize", onScroll)

    return () => {
      el.removeEventListener("scroll", onScroll)
      el.removeEventListener("wheel", onWheel)
      window.removeEventListener("resize", onScroll)
    }
  }, [playScrollTick, updateFades])

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-5">
        <div 
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }} 
        />
        <h3 className="text-[#f1f5f9] font-semibold text-lg tracking-wide">{title}</h3>
        <div className="h-px flex-1 bg-gradient-to-r from-[#1e293b] to-transparent" />
        <span className="text-[#64748b] text-sm font-mono">{chapters.length} chapters</span>
      </div>
      
      <div className="scroll-fade-container">
        <div className="scroll-fade-left" style={{ opacity: leftFade }} />
        <div className="scroll-fade-right" style={{ opacity: rightFade }} />
        <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-4 cyber-scroll">
          {chapters.map((chapter, index) => (
            <ChapterCard key={chapter.name} chapter={chapter} accent={accent} glowClass={glowClass} index={index} />
          ))}
        </div>
      </div>
    </div>
  )
}

export function ChapterScrollSection() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Chapter Progress</h2>
        <div className="flex items-center gap-2 text-xs text-[#64748b]">
          <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
          <span>Needs revision</span>
        </div>
      </div>
      
      <SubjectRow title="Physics" chapters={physicsChapters} accent="#a855f7" glowClass="card-glow-purple" />
      <SubjectRow title="Chemistry" chapters={chemistryChapters} accent="#22d3ee" glowClass="card-glow-cyan" />
      <SubjectRow title="Mathematics" chapters={mathsChapters} accent="#f472b6" glowClass="card-glow-pink" />
    </section>
  )
}
