"use client"

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from "recharts"

interface SkillData {
  subject: string
  value: number
  fullMark: number
}

interface SkillRadarChartProps {
  data: SkillData[]
  accentColor: string
  fillColor: string
}

export function SkillRadarChart({ data, accentColor, fillColor }: SkillRadarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
        <PolarGrid
          stroke="#1e293b"
          strokeOpacity={0.6}
          radialLines={true}
        />
        <PolarAngleAxis
          dataKey="subject"
          tick={{
            fill: "#64748b",
            fontSize: 11,
            fontWeight: 500,
          }}
          tickLine={false}
          axisLine={false}
        />
        <Radar
          name="Skills"
          dataKey="value"
          stroke={accentColor}
          strokeWidth={2}
          fill={fillColor}
          fillOpacity={0.25}
          dot={{
            r: 3,
            fill: accentColor,
            strokeWidth: 0,
          }}
          activeDot={{
            r: 5,
            fill: accentColor,
            stroke: accentColor,
            strokeWidth: 2,
            strokeOpacity: 0.5,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  )
}
