'use client'

import { useEffect, useRef, useMemo } from 'react'
import { Chart, registerables } from 'chart.js'
import { 
  Target, 
  Flame, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  BookMarked,
  Zap,
  Sparkles
} from 'lucide-react'
import type { AppData, Analytics, Subject } from '@/lib/jee-os/types'
import { ChapterRadarStrip } from '@/components/jee-os/pages/chapter-radar-strip'

Chart.register(...registerables)

interface OverviewPageProps {
  data: AppData
  analytics: Analytics
}

export function OverviewPage({ data, analytics }: OverviewPageProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  // Calculate 7-day activity data (includes all types including Step 3)
  const activityData = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 86400000)
      const dateStr = date.toISOString().split('T')[0]
      const dayName = date.toLocaleDateString('en', { weekday: 'short' })
      const count = data.progressLogs
        .filter(log => log.date === dateStr)
        .reduce((sum, log) => sum + log.solved, 0)
      days.push({ date: dateStr, day: dayName, count })
    }
    return days
  }, [data.progressLogs])

  // Chart setup
  useEffect(() => {
    if (!chartRef.current) return

    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current.getContext('2d')
    if (!ctx) return

    const gradient = ctx.createLinearGradient(0, 0, 0, 200)
    gradient.addColorStop(0, 'rgba(168, 85, 247, 0.4)')
    gradient.addColorStop(1, 'rgba(168, 85, 247, 0)')

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: activityData.map(d => d.day),
        datasets: [{
          data: activityData.map(d => d.count),
          borderColor: '#a855f7',
          backgroundColor: gradient,
          fill: true,
          tension: 0.4,
          borderWidth: 3,
          pointRadius: 4,
          pointBackgroundColor: '#a855f7',
          pointBorderColor: '#030508',
          pointBorderWidth: 2,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#22d3ee',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(13, 18, 28, 0.95)',
            borderColor: 'rgba(168, 85, 247, 0.3)',
            borderWidth: 1,
            titleColor: '#f1f5f9',
            bodyColor: '#94a3b8',
            padding: 12,
            cornerRadius: 8,
            displayColors: false,
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(148, 163, 184, 0.06)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(148, 163, 184, 0.06)' },
            ticks: { color: '#64748b', font: { size: 11 } }
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [activityData])

  const goalProgress = data.dailyGoal > 0 
    ? Math.min((analytics.todayQuestions / data.dailyGoal) * 100, 100) 
    : 0

  const excludeStep3 = data.settings?.excludeStep3FromCalculations ?? false

  // Calculate overall progress based on actual questions solved
  const overallProgress = (['Physics', 'Chemistry', 'Mathematics'] as Subject[]).reduce((sum, s) => {
    const chapters = data.subjects[s]
    const totalPossible = chapters.reduce((t, ch) => t + ch.exerciseTotal + ch.step2Total + (excludeStep3 ? 0 : ch.step3Total), 0)
    const totalSolved = chapters.reduce((t, ch) => {
      const logs = data.progressLogs.filter(log => log.subject === s && log.chapter === ch.name)
      return t + logs.reduce((s, l) => {
        if (excludeStep3 && l.type === 'Step 3') return s
        return s + (l.type === 'Step 3' && l.step3Question ? l.step3Question : l.solved)
      }, 0)
    }, 0)
    return sum + (totalPossible > 0 ? (totalSolved / totalPossible) * 100 : 0)
  }, 0) / 3

  return (
    <div className="space-y-6 animate-entrance">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--neon-purple)] to-[var(--neon-pink)] flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-[var(--text-primary)] tracking-tight">
              Mission Control
            </h1>
            <p className="text-sm text-[var(--text-muted)]">Your JEE prep at a glance</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          label="Total Done"
          value={analytics.totalQuestions.toLocaleString()}
          sub="questions solved"
          icon={<CheckCircle2 className="w-5 h-5" />}
          color="purple"
        />
        <StatCard
          label="Today"
          value={analytics.todayQuestions.toString()}
          sub="solved today"
          icon={<Target className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard
          label="Streak"
          value={analytics.streak.toString()}
          sub="days in a row"
          icon={<Flame className="w-5 h-5" />}
          color="amber"
        />
        <StatCard
          label="Overall"
          value={`${overallProgress.toFixed(0)}%`}
          sub="syllabus covered"
          icon={<TrendingUp className="w-5 h-5" />}
          color="green"
        />
      </div>

      {/* Daily Goal */}
      <div className="glass-card p-6 animate-entrance animate-entrance-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[var(--neon-purple)]" />
            <span className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase">Daily Goal</span>
          </div>
          <span className={`tag-void ${goalProgress >= 100 ? 'tag-green' : goalProgress > 50 ? 'tag-amber' : 'tag-purple'}`}>
            {goalProgress >= 100 ? 'COMPLETED' : 'IN PROGRESS'}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">
            {analytics.todayQuestions}
          </span>
          <span className="text-[var(--text-muted)]">/</span>
          <span className="text-lg text-[var(--text-secondary)] tabular-nums">
            {data.dailyGoal}
          </span>
        </div>
        <div className="progress-track">
          <div 
            className={`progress-fill ${goalProgress >= 100 ? 'progress-green' : 'progress-purple'}`}
            style={{ width: `${goalProgress}%` }}
          />
        </div>
      </div>

      {/* Subject Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
        {analytics.subjectStats.map((stat, i) => (
          <SubjectCard key={stat.subject} stat={stat} index={i} />
        ))}
      </div>

      <ChapterRadarStrip data={data} />

      {/* Activity Chart */}
      <div className="glass-card p-6 animate-entrance animate-entrance-3">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-4 h-4 text-[var(--neon-cyan)]" />
          <span className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase">7-Day Activity</span>
        </div>
        <div className="h-[200px]">
          <canvas ref={chartRef} />
        </div>
      </div>

      {/* Revision Queue */}
      <div className="glass-card p-6 animate-entrance animate-entrance-4">
        <div className="flex items-center gap-2 mb-4">
          <BookMarked className="w-4 h-4 text-[var(--neon-pink)]" />
          <span className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase">Revision Queue</span>
          {analytics.flaggedForRevision.length > 0 && (
            <span className="tag-void tag-pink ml-auto">{analytics.flaggedForRevision.length}</span>
          )}
        </div>
        {analytics.flaggedForRevision.length === 0 ? (
          <div className="text-center py-8 text-[var(--text-ghost)]">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No items flagged for revision</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {analytics.flaggedForRevision.slice(0, 10).map(item => (
              <div 
                key={item.id} 
                className="flex items-center justify-between p-3 rounded-lg bg-[var(--void-surface)] border border-[var(--border-subtle)] hover:border-[var(--neon-purple-dim)] transition-all"
              >
                <div>
                  <div className="font-medium text-[var(--text-primary)] text-sm">{item.chapter}</div>
                  <div className="text-xs text-[var(--text-muted)]">{item.subject} • {item.type}</div>
                </div>
                <span className={`tag-void ${
                  item.subject === 'Physics' ? 'tag-purple' : 
                  item.subject === 'Chemistry' ? 'tag-cyan' : 'tag-pink'
                }`}>
                  {item.doubts || 'Review'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ 
  label, 
  value, 
  sub, 
  icon,
  color 
}: { 
  label: string
  value: string
  sub: string
  icon: React.ReactNode
  color: 'purple' | 'cyan' | 'amber' | 'green' | 'pink'
}) {
  const colorClasses = {
    purple: 'from-[var(--neon-purple)] to-[#9333ea]',
    cyan: 'from-[var(--neon-cyan)] to-[#06b6d4]',
    amber: 'from-[var(--neon-amber)] to-[#f59e0b]',
    green: 'from-[var(--neon-green)] to-[#22c55e]',
    pink: 'from-[var(--neon-pink)] to-[#ec4899]',
  }

  const textColors = {
    purple: 'text-[var(--neon-purple)]',
    cyan: 'text-[var(--neon-cyan)]',
    amber: 'text-[var(--neon-amber)]',
    green: 'text-[var(--neon-green)]',
    pink: 'text-[var(--neon-pink)]',
  }

  return (
    <div className="glass-card stat-card p-5 group">
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <div className="text-white">{icon}</div>
      </div>
      <div className="text-[10px] font-bold tracking-widest text-[var(--text-ghost)] uppercase mb-2">
        {label}
      </div>
      <div className={`text-3xl font-bold tabular-nums ${textColors[color]} group-hover:scale-105 transition-transform origin-left`}>
        {value}
      </div>
      <div className="text-xs text-[var(--text-muted)] mt-1">{sub}</div>
    </div>
  )
}

function SubjectCard({ 
  stat, 
  index 
}: { 
  stat: { subject: Subject; totalChapters: number; touchedChapters: number }
  index: number
}) {
  const colors = ['purple', 'cyan', 'pink'] as const
  const color = colors[index]
  const progress = stat.totalChapters > 0 
    ? (stat.touchedChapters / stat.totalChapters) * 100 
    : 0

  return (
    <div className="glass-card p-5">
      <div className="text-xs font-bold tracking-widest text-[var(--text-muted)] uppercase mb-4">
        {stat.subject}
      </div>
      <div className="progress-track mb-3">
        <div 
          className={`progress-fill progress-${color}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="text-xs text-[var(--text-ghost)]">
        {stat.touchedChapters} / {stat.totalChapters} chapters touched
      </div>
    </div>
  )
}
