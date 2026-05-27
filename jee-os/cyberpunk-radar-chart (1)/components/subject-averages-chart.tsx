"use client"

import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from "recharts"

const data = [
  { subject: "Physics", notes: 76, step2: 57, step3: 33, color: "#a855f7" },
  { subject: "Chemistry", notes: 64, step2: 49, step3: 27, color: "#22d3ee" },
  { subject: "Mathematics", notes: 81, step2: 66, step3: 43, color: "#f472b6" },
]

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

export function SubjectAveragesChart() {
  return (
    <section className="w-full mt-12">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-[#f1f5f9] tracking-tight">Subject Averages</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-[#1e293b] to-transparent" />
      </div>
      
      <div className="glass-card glow-purple rounded-2xl p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Notes Average */}
          <div className="fade-in" style={{ animationDelay: "0.1s" }}>
            <div className="flex items-center gap-2 mb-5">
              <div className="w-1 h-4 rounded-full bg-gradient-to-b from-[#a855f7] to-[#22d3ee]" />
              <h4 className="text-sm text-[#64748b] uppercase tracking-widest">Notes</h4>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} layout="vertical" barGap={8}>
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
                  <Bar dataKey="notes" radius={[0, 6, 6, 0]} barSize={24}>
                    {data.map((entry, index) => (
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
                <BarChart data={data} layout="vertical" barGap={8}>
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
                    {data.map((entry, index) => (
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
                <BarChart data={data} layout="vertical" barGap={8}>
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
                    {data.map((entry, index) => (
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
          {data.map((item) => (
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
