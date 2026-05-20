import { getFileContent, getDirectoryContent } from '@/lib/github'
import { parseMindsetMap } from '@/lib/parsers'
import Link from 'next/link'
import { Users, Brain, Activity } from 'lucide-react'

import PrintButton from '@/components/PrintButton'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const mindsetRaw = await getFileContent('mindset-map.md')
  const shifts = mindsetRaw ? parseMindsetMap(mindsetRaw) : []

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

  const studentsDir = await getDirectoryContent('students')
  const students = Array.isArray(studentsDir) ? studentsDir.filter((c: any) => c.type === 'dir') : []

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8 print:bg-white">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-start">
        <div>
          <Link href="/curator" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block no-print transition-colors">
            ← Назад к дашборду
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F7EE] text-[#00A859] rounded-full text-xs font-semibold uppercase tracking-wider mb-3 no-print">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
            Отчёт когорты
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Аналитика когорты</h1>
          <p className="text-[#4A4A4A] mt-2">Отчёт по прогрессу и Mindset-сдвигам</p>
        </div>
        <PrintButton />
      </header>

      <div className="max-w-6xl mx-auto space-y-8">

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-[#D9D9D9] rounded-[14px] p-6 bcc-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">Всего студентов</h3>
              <div className="w-10 h-10 bg-[#E6F7EE] rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-[#00A859]" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-5xl font-bold text-[#1A1A1A]">{students.length}</p>
          </div>

          <div className="bg-white border border-[#D9D9D9] rounded-[14px] p-6 bcc-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">Всего сдвигов</h3>
              <div className="w-10 h-10 bg-[#E6F7EE] rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-[#00A859]" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-5xl font-bold text-[#1A1A1A]">{shifts.length}</p>
          </div>

          <div className="bg-white border border-[#D9D9D9] rounded-[14px] p-6 bcc-shadow">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">Активность (сессии)</h3>
              <div className="w-10 h-10 bg-[#E6F7EE] rounded-full flex items-center justify-center">
                <Activity className="w-5 h-5 text-[#00A859]" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-5xl font-bold text-[#1A1A1A]">{totalStatuses}</p>
          </div>
        </div>

        {/* Mindset Distribution */}
        <section className="bg-white border border-[#D9D9D9] rounded-[14px] p-6 bcc-shadow">
          <h2 className="text-xl font-bold mb-6 text-[#1A1A1A]">Распределение статусов Mindset</h2>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#007A40] font-semibold">Seeded ({seeded})</span>
                <span className="text-[#8C8C8C] font-medium">{totalStatuses > 0 ? Math.round((seeded/totalStatuses)*100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden border border-[#D9D9D9]">
                <div
                  className="h-full bg-[#00A859]"
                  style={{ width: `${totalStatuses > 0 ? (seeded/totalStatuses)*100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#1F6FEB] font-semibold">Emerging ({emerging})</span>
                <span className="text-[#8C8C8C] font-medium">{totalStatuses > 0 ? Math.round((emerging/totalStatuses)*100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden border border-[#D9D9D9]">
                <div
                  className="h-full bg-[#1F6FEB]"
                  style={{ width: `${totalStatuses > 0 ? (emerging/totalStatuses)*100 : 0}%` }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-[#0FB5BA] font-semibold">Internalized ({internalized})</span>
                <span className="text-[#8C8C8C] font-medium">{totalStatuses > 0 ? Math.round((internalized/totalStatuses)*100) : 0}%</span>
              </div>
              <div className="w-full h-3 bg-[#F5F5F5] rounded-full overflow-hidden border border-[#D9D9D9]">
                <div
                  className="h-full bg-[#0FB5BA]"
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
