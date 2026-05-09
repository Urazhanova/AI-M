import { getFileContent, getDirectoryContent } from '@/lib/github'
import { parseMindsetMap } from '@/lib/parsers'
import Link from 'next/link'
import { Download, Users, Brain, Activity } from 'lucide-react'

// Simple client component for the print button
import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  // Fetch data
  const mindsetRaw = await getFileContent('mindset-map.md')
  const shifts = mindsetRaw ? parseMindsetMap(mindsetRaw) : []
  
  // Calculate basic stats for mindset
  let seeded = 0
  let emerging = 0
  let internalized = 0
  let totalStatuses = 0

  shifts.forEach(shift => {
    Object.values(shift.statuses).forEach(status => {
      const lower = status.toLowerCase()
      if (lower.includes('seeded')) seeded++
      if (lower.includes('emerging')) emerging++
      if (lower.includes('internalized')) internalized++
      if (lower !== '-' && lower !== '') totalStatuses++
    })
  })

  // Students count
  const studentsDir = await getDirectoryContent('students')
  const students = Array.isArray(studentsDir) ? studentsDir.filter((c: any) => c.type === 'dir') : []

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8 print:bg-white print:text-black">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-start">
        <div>
          <Link href="/curator" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block no-print">
            ← Назад к дашборду
          </Link>
          <h1 className="text-4xl font-bold tracking-tight">Аналитика Когорты</h1>
          <p className="text-zinc-400 mt-2 print:text-zinc-600">Отчет по прогрессу и Mindset-сдвигам</p>
        </div>
        <PrintButton />
      </header>

      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg print:border-zinc-300 print:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-400 print:text-zinc-600">Всего студентов</h3>
              <Users className="w-5 h-5 text-blue-400 print:text-blue-600" />
            </div>
            <p className="text-4xl font-bold">{students.length}</p>
          </div>
          
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg print:border-zinc-300 print:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-400 print:text-zinc-600">Всего сдвигов</h3>
              <Brain className="w-5 h-5 text-purple-400 print:text-purple-600" />
            </div>
            <p className="text-4xl font-bold">{shifts.length}</p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg print:border-zinc-300 print:shadow-none">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-zinc-400 print:text-zinc-600">Активность (сессии)</h3>
              <Activity className="w-5 h-5 text-emerald-400 print:text-emerald-600" />
            </div>
            <p className="text-4xl font-bold">{totalStatuses}</p>
          </div>
        </div>

        {/* Mindset Distribution */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg print:border-zinc-300 print:shadow-none">
          <h2 className="text-xl font-semibold mb-6">Распределение статусов Mindset</h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-emerald-400 font-medium">Seeded ({seeded})</span>
                <span className="text-zinc-400">{totalStatuses > 0 ? Math.round((seeded/totalStatuses)*100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden print:bg-zinc-200">
                <div 
                  className="h-full bg-emerald-500" 
                  style={{ width: `${totalStatuses > 0 ? (seeded/totalStatuses)*100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-blue-400 font-medium">Emerging ({emerging})</span>
                <span className="text-zinc-400">{totalStatuses > 0 ? Math.round((emerging/totalStatuses)*100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden print:bg-zinc-200">
                <div 
                  className="h-full bg-blue-500" 
                  style={{ width: `${totalStatuses > 0 ? (emerging/totalStatuses)*100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-purple-400 font-medium">Internalized ({internalized})</span>
                <span className="text-zinc-400">{totalStatuses > 0 ? Math.round((internalized/totalStatuses)*100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden print:bg-zinc-200">
                <div 
                  className="h-full bg-purple-500" 
                  style={{ width: `${totalStatuses > 0 ? (internalized/totalStatuses)*100 : 0}%` }}
                ></div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}
