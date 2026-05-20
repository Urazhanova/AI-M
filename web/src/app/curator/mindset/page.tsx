import { getFileContent } from '@/lib/github'
import { parseMindsetMap, MindsetShift } from '@/lib/parsers'
import { BrainCircuit } from 'lucide-react'
import Link from 'next/link'

export default async function MindsetMapPage() {
  const fileContent = await getFileContent('mindset-map.md')
  const shifts: MindsetShift[] = fileContent ? parseMindsetMap(fileContent) : []

  const studentNames = new Set<string>()
  shifts.forEach(shift => {
    Object.keys(shift.statuses).forEach(name => studentNames.add(name))
  })
  const students = Array.from(studentNames)

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'seeded': return 'bg-[#E6F7EE] text-[#007A40] border-[#00A859]/30'
      case 'emerging': return 'bg-[#E8F1FE] text-[#1F6FEB] border-[#1F6FEB]/30'
      case 'internalized': return 'bg-[#E0F7F8] text-[#0FB5BA] border-[#0FB5BA]/30'
      default: return 'bg-[#F5F5F5] text-[#8C8C8C] border-[#D9D9D9]'
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-10 max-w-7xl mx-auto flex justify-between items-end">
        <div>
          <Link href="/curator" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block transition-colors">
            ← Назад к дашборду
          </Link>
          <h1 className="text-4xl font-bold tracking-tight flex items-center text-[#1A1A1A]">
            <span className="w-12 h-12 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-4">
              <BrainCircuit className="w-7 h-7 text-[#00A859]" strokeWidth={1.5} />
            </span>
            Mindset Map
          </h1>
          <p className="text-[#4A4A4A] mt-2 text-lg">Глобальная карта сдвигов (из mindset-map.md)</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-white border border-[#D9D9D9] rounded-[14px] bcc-shadow overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F5F5F5] border-b border-[#D9D9D9]">
                <th className="p-4 font-semibold text-[#1A1A1A] w-16 text-xs uppercase tracking-wider">#</th>
                <th className="p-4 font-semibold text-[#1A1A1A] w-1/4 text-xs uppercase tracking-wider">От (From)</th>
                <th className="p-4 font-semibold text-[#1A1A1A] w-1/4 text-xs uppercase tracking-wider">К (To)</th>
                <th className="p-4 font-semibold text-[#1A1A1A] text-xs uppercase tracking-wider">Чанк</th>
                {students.map(s => (
                  <th key={s} className="p-4 font-semibold text-[#1A1A1A] text-center text-xs uppercase tracking-wider capitalize">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D9D9D9]">
              {shifts.length > 0 ? shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-[#F5F5F5] transition-colors">
                  <td className="p-4 text-[#8C8C8C] font-medium">{shift.id}</td>
                  <td className="p-4 font-medium text-[#1A1A1A]">{shift.from}</td>
                  <td className="p-4 font-medium text-[#1A1A1A]">{shift.to}</td>
                  <td className="p-4 text-sm font-mono text-[#4A4A4A]">{shift.firstChunk}</td>
                  {students.map(s => (
                    <td key={s} className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full border font-semibold ${getStatusColor(shift.statuses[s])}`}>
                        {shift.statuses[s] || '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={4 + students.length} className="p-8 text-center text-[#8C8C8C]">
                    Не удалось загрузить данные из mindset-map.md
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
