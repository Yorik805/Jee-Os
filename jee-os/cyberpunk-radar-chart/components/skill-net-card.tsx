"use client"

import { SkillRadarChart } from "./skill-radar-chart"

interface SkillData {
  subject: string
  value: number
  fullMark: number
}

interface LegendItem {
  label: string
  color: string
}

interface SkillNetCardProps {
  title: string
  data: SkillData[]
  accentColor: string
  glowColor: string
  legend?: LegendItem[]
}

export function SkillNetCard({
  title,
  data,
  accentColor,
  glowColor,
  legend,
}: SkillNetCardProps) {
  return (
    <div
      className="group relative rounded-xl border border-border/50 bg-void-surface/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1"
      style={{
        boxShadow: `0 0 40px -12px ${glowColor}20, 0 4px 24px -8px rgba(0, 0, 0, 0.4)`,
      }}
    >
      {/* Subtle glow border effect */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          boxShadow: `inset 0 0 0 1px ${glowColor}30, 0 0 60px -8px ${glowColor}25`,
        }}
      />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: accentColor }}
          />
          <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
            {title}
          </span>
        </div>

        {/* Radar Chart */}
        <div className="relative">
          <SkillRadarChart
            data={data}
            accentColor={accentColor}
            fillColor={accentColor}
          />
        </div>

        {/* Legend Chips */}
        {legend && legend.length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {legend.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-1.5 rounded-full bg-secondary/50 px-2.5 py-1"
              >
                <div
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-[10px] font-medium text-text-muted">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
