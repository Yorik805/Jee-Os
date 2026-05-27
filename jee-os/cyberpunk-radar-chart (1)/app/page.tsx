import { ChapterScrollSection } from "@/components/chapter-scroll-section"
import { SubjectAveragesChart } from "@/components/subject-averages-chart"

export default function Page() {
  return (
    <main className="min-h-screen p-6 md:p-10 cyber-grid" style={{ backgroundColor: "#030508" }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-[#f1f5f9] tracking-tight mb-2">
            JEE Analytics
          </h1>
          <p className="text-[#64748b]">Track your preparation progress</p>
          <div className="h-1 w-24 mt-4 rounded-full bg-gradient-to-r from-[#a855f7] via-[#22d3ee] to-[#f472b6]" />
        </div>
        
        <ChapterScrollSection />
        <SubjectAveragesChart />
      </div>
    </main>
  )
}
