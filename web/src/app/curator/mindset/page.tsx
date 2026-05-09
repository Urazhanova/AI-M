import { getFileContent } from '@/lib/github'
import { parseMindsetMap, MindsetShift } from '@/lib/parsers'
import { BrainCircuit } from 'lucide-react'
import Link from 'next/link'

export default async function MindsetMapPage() {
  const fileContent = await getFileContent('mindset-map.md')
  const shifts: MindsetShift[] = fileContent ? parseMindsetMap(fileContent) : []

  // Collect all unique student names
  const studentNames = new Set<string>()
  shifts.forEach(shift => {
    Object.keys(shift.statuses).forEach(name => studentNames.add(name))
  })
  const students = Array.from(studentNames)

  const getStatusColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'seeded': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      case 'emerging': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'internalized': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      default: return 'bg-zinc-800/50 text-zinc-500 border-zinc-700/50'
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-10 max-w-7xl mx-auto flex justify-between items-end">
        <div>
          <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Назад к дашборду
          </Link>
          <h1 className="text-4xl font-bold tracking-tight flex items-center">
            <BrainCircuit className="w-10 h-10 mr-4 text-purple-400" />
            Mindset Map
          </h1>
          <p className="text-zinc-400 mt-2 text-lg">Глобальная карта сдвигов (из mindset-map.md)</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <div className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-lg overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-900/50 border-b border-zinc-800">
                <th className="p-4 font-semibold text-zinc-300 w-16">#</th>
                <th className="p-4 font-semibold text-zinc-300 w-1/4">От (From)</th>
                <th className="p-4 font-semibold text-zinc-300 w-1/4">К (To)</th>
                <th className="p-4 font-semibold text-zinc-300">Чанк</th>
                {students.map(s => (
                  <th key={s} className="p-4 font-semibold text-zinc-300 text-center">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {shifts.length > 0 ? shifts.map(shift => (
                <tr key={shift.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-4 text-zinc-500">{shift.id}</td>
                  <td className="p-4 font-medium text-zinc-200">{shift.from}</td>
                  <td className="p-4 font-medium text-zinc-200">{shift.to}</td>
                  <td className="p-4 text-sm font-mono text-zinc-400">{shift.firstChunk}</td>
                  {students.map(s => (
                    <td key={s} className="p-4 text-center">
                      <span className={`inline-block px-3 py-1 text-xs rounded-full border ${getStatusColor(shift.statuses[s])}`}>
                        {shift.statuses[s] || '—'}
                      </span>
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={4 + students.length} className="p-8 text-center text-zinc-500">
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
