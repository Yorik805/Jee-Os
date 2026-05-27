"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts"
import type { AppData, Subject } from "@/lib/jee-os/types"

interface SubjectAveragesChartProps {
  data: AppData
}

interface ChartData {
  subject: string
  exercise: number
  step2: number
  step3: number
  color: string
}

function calculateSubjectAverages(data: AppData): ChartData[] {
  const subjects: Subject[] = ['Physics', 'Chemistry', 'Mathematics']
  const colors: Record<Subject, string> = {
    Physics: '#a855f7',
    Chemistry: '#22d3ee',
    Mathematics: '#f472b6'
  }

  return subjects.map(subject => {
    const chapters = data.subjects[subject]
    
    if (chapters.length === 0) {
      return { subject, exercise: 0, step2: 0, step3: 0, color: colors[subject] }
    }

    // Calculate exercise completion percentage for each chapter
    const exercisePercentages = chapters.map(chapter => {
      if (chapter.exerciseTotal === 0) return 0
      return (chapter.exerciseDone / chapter.exerciseTotal) * 100
    })

    // Calculate mean of all exercise percentages
    const meanExercise = exercisePercentages.reduce((sum, pct) => sum + pct, 0) / chapters.length

    // Calculate step2 mean
    const step2Percentages = chapters.map(chapter => {
      if (chapter.step2Total === 0) return 0
      return (chapter.step2Done / chapter.step2Total) * 100
    })
    const meanStep2 = step2Percentages.reduce((sum, pct) => sum + pct, 0) / chapters.length

    // Calculate step3 mean
    const step3Percentages = chapters.map(chapter => {
      if (chapter.step3Total === 0) return 0
      return (chapter.step3Done / chapter.step3Total) * 100
    })
    const meanStep3 = step3Percentages.reduce((sum, pct) => sum + pct, 0) / chapters.length

    return {
      subject,
      exercise: Math.round(meanExercise),
      step2: Math.round(meanStep2),
      step3: Math.round(meanStep3),
      color: colors[subject]
    }
  })
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-card rounded-lg px-3 py-2 border border-[#1e293b]">
        <p className="text-[#f1f5f9] text-sm font-medium mb-1">{label}</p>
        <p className="text-[#64748b] text-xs font-mono">{payload[0].value}%</p>
      </div>
    )
  }
  return null
}

export function SubjectAveragesChart({ data }: SubjectAveragesChartProps) {
  const chartData = calculateSubjectAverages(data)

  return (
    <section className="w-full mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Subject Averages</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#1e293b] to-transparent" />
      </div>
      
      <div className="glass-card glow-purple rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Exercise Average */}
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#a855f7] to-[#22d3ee]" />
              <h4 className="text-sm text-[#64748b] uppercase tracking-widest">Exercise</h4>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barGap={8}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="subject" 
                    width={80} 
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="exercise" radius={[0, 6, 6, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Step 2 Average */}
          <div className="fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#22d3ee] to-[#f472b6]" />
              <h4 className="text-sm text-[#64748b] uppercase tracking-widest">Step 2</h4>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barGap={8}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="subject" 
                    width={80} 
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="step2" radius={[0, 6, 6, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} fillOpacity={0.7} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Step 3 Average */}
          <div className="fade-in" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#f472b6] to-[#a855f7]" />
              <h4 className="text-sm text-[#64748b] uppercase tracking-widest">Step 3</h4>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" barGap={8}>
                  <XAxis type="number" domain={[0, 100]} hide />
                  <YAxis 
                    type="category" 
                    dataKey="subject" 
                    width={80} 
                    tick={{ fill: "#64748b", fontSize: 11, fontFamily: "monospace" }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <Tooltip content={<CustomTooltip />} cursor={false} />
                  <Bar dataKey="step3" radius={[0, 6, 6, 0]} barSize={24}>
                    {chartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-8 mt-8 pt-6 border-t border-[#1e293b]/50">
          {chartData.map((item) => (
            <div key={item.subject} className="flex items-center gap-3 group cursor-pointer">
              <div 
                className="w-3 h-3 rounded-full transition-all group-hover:scale-125"
                style={{ backgroundColor: item.color, boxShadow: `0 0 10px ${item.color}40` }} 
              />
              <span className="text-sm text-[#64748b] group-hover:text-[#f1f5f9] transition-colors">{item.subject}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}