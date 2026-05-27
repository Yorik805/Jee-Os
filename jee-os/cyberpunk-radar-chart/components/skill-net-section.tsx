"use client"

import { SkillNetCard } from "./skill-net-card"

// Physics skill data
const physicsData = [
  { subject: "Mechanics", value: 85, fullMark: 100 },
  { subject: "Electro.", value: 72, fullMark: 100 },
  { subject: "Optics", value: 78, fullMark: 100 },
  { subject: "Thermo.", value: 65, fullMark: 100 },
  { subject: "Modern", value: 58, fullMark: 100 },
  { subject: "Waves", value: 80, fullMark: 100 },
]

// Chemistry skill data
const chemistryData = [
  { subject: "Organic", value: 70, fullMark: 100 },
  { subject: "Inorganic", value: 82, fullMark: 100 },
  { subject: "Physical", value: 68, fullMark: 100 },
  { subject: "Analytical", value: 75, fullMark: 100 },
  { subject: "Biochem.", value: 55, fullMark: 100 },
  { subject: "Environ.", value: 62, fullMark: 100 },
]

// Mathematics skill data
const mathematicsData = [
  { subject: "Calculus", value: 88, fullMark: 100 },
  { subject: "Algebra", value: 92, fullMark: 100 },
  { subject: "Geometry", value: 75, fullMark: 100 },
  { subject: "Trig.", value: 82, fullMark: 100 },
  { subject: "Statistics", value: 70, fullMark: 100 },
  { subject: "Vectors", value: 78, fullMark: 100 },
]

export function SkillNetSection() {
  return (
    <section className="min-h-screen bg-void px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-text-muted">
            Performance Analytics
          </p>
          <h2 className="text-balance text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Your Skill Network
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-pretty text-sm text-text-muted">
            Track your proficiency across JEE subjects with precision analytics
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <SkillNetCard
            title="Physics Skill Net"
            data={physicsData}
            accentColor="#a855f7"
            glowColor="#a855f7"
            legend={[
              { label: "Strong", color: "#4ade80" },
              { label: "Moderate", color: "#facc15" },
              { label: "Needs Work", color: "#f87171" },
            ]}
          />
          <SkillNetCard
            title="Chemistry Skill Net"
            data={chemistryData}
            accentColor="#22d3ee"
            glowColor="#22d3ee"
            legend={[
              { label: "Strong", color: "#4ade80" },
              { label: "Moderate", color: "#facc15" },
              { label: "Needs Work", color: "#f87171" },
            ]}
          />
          <SkillNetCard
            title="Mathematics Skill Net"
            data={mathematicsData}
            accentColor="#f472b6"
            glowColor="#f472b6"
            legend={[
              { label: "Strong", color: "#4ade80" },
              { label: "Moderate", color: "#facc15" },
              { label: "Needs Work", color: "#f87171" },
            ]}
          />
        </div>
      </div>
    </section>
  )
}
