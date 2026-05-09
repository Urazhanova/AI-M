import { BookOpen, Target, CheckCircle, PlayCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'
import { getFileContent } from '@/lib/github'
import { parseSequence } from '@/lib/parsers'

export const dynamic = 'force-dynamic'

type Session = {
  chunkId: string
  date: string
  dod: string
  bloomLevels: string
  reflection: string
}

function parseProgressMd(content: string): Session[] {
  const sessions: Session[] = []
  const blocks = content.split(/\n---\n/).filter(b => b.trim())

  for (const block of blocks) {
    // Match: ## YYYY-MM-DD — chunk-id  (supports — – -)
    const headerMatch = block.match(/##\s+(\d{4}-\d{2}-\d{2})\s+[—–-]\s+([\w-]+)/)
    if (!headerMatch) continue

    const date = headerMatch[1]
    const chunkId = headerMatch[2]

    const dodMatch = block.match(/\*\*Статус DoD:\*\*\s*(.+)/)
    const bloomMatch = block.match(/\*\*Уровни Блума достигнуты:\*\*\s*(.+)/)
    const reflectionMatch = block.match(/### Рефлексия\n([\s\S]*?)(?:\n###|\n---|\n$|$)/)

    const dateObj = new Date(date)
    const dateStr = dateObj.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

    sessions.push({
      chunkId,
      date: dateStr,
      dod: dodMatch ? dodMatch[1].trim() : '—',
      bloomLevels: bloomMatch ? bloomMatch[1].trim() : '',
      reflection: reflectionMatch ? reflectionMatch[1].trim() : '',
    })
  }

  return sessions.reverse()
}

export default async function StudentDashboard({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params

  const sequenceRaw = await getFileContent('course/sequence.md')
  const units = sequenceRaw ? parseSequence(sequenceRaw) : []
  const unitTitleMap = Object.fromEntries(units.map(u => [u.id, u.title]))

  const progressRaw = await getFileContent(`students/${name}/progress.md`)
  let passedChunks: string[] = []
  let sessions: Session[] = []

  if (progressRaw) {
    sessions = parseProgressMd(progressRaw)
    passedChunks = [...new Set(sessions.map(s => s.chunkId))]
  }

  const studentDisplayName = name.charAt(0).toUpperCase() + name.slice(1)

  const dodColor = (dod: string) => {
    const d = dod.toLowerCase()
    if (d.includes('completed') || d.includes('полный')) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
    if (d.includes('progress') || d.includes('минимальный')) return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
    return 'bg-zinc-700/50 text-zinc-400 border-zinc-700'
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-10 max-w-4xl mx-auto flex justify-between items-start">
        <div>
          <Link href="/student" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block no-print">
            ← Назад к выбору профиля
          </Link>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-blue-100 to-blue-400 bg-clip-text text-transparent">Привет, {studentDisplayName}!</h1>
          <p className="text-zinc-400 mt-2 text-lg print:text-zinc-600">AI Mindset Tracker</p>
        </div>
        <PrintButton />
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress summary */}
        <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-6 flex items-center">
            <Target className="w-5 h-5 mr-3 text-blue-400" />
            Твой прогресс
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-5 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
              <p className="text-sm text-zinc-400 mb-1">Пройдено чанков</p>
              <p className="text-3xl font-bold">{passedChunks.length} <span className="text-lg text-zinc-500 font-normal">/ {units.length}</span></p>
            </div>
            <div className="flex-1 p-5 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
              <p className="text-sm text-zinc-400 mb-1">Следующий шаг</p>
              <p className="text-lg font-medium text-blue-400">
                {units.find(u => !passedChunks.includes(u.id))?.title || "Всё пройдено!"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg no-print">
          <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/50">
            <h2 className="text-xl font-semibold flex items-center">
              <PlayCircle className="w-5 h-5 mr-3 text-blue-400" />
              Твой учебный план
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
              {units.map((unit, idx) => {
                const isPassed = passedChunks.includes(unit.id)
                return (
                  <div key={unit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-900 ${isPassed ? 'bg-emerald-500 text-white' : 'bg-zinc-800 text-zinc-500'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow z-10`}>
                      {isPassed ? <CheckCircle className="w-5 h-5" /> : <span>{idx + 1}</span>}
                    </div>
                    <Link href={`/student/${name}/unit/${unit.id}`} className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border ${isPassed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-zinc-950/50 border-zinc-800 hover:border-blue-500/50 hover:bg-zinc-800/50'} transition-colors`}>
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${isPassed ? 'text-emerald-400' : 'text-zinc-200 group-hover:text-blue-400'}`}>{unit.title}</h3>
                        <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{unit.type}</span>
                      </div>
                      <p className="text-sm text-zinc-500 mt-2 font-mono">{unit.id}</p>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Session history */}
        <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/50">
            <h2 className="text-xl font-semibold flex items-center">
              <BookOpen className="w-5 h-5 mr-3 text-emerald-400" />
              История сессий
            </h2>
          </div>
          <div className="p-0">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>Сессий пока нет. Начни первый юнит!</p>
              </div>
            ) : (
              <ul className="divide-y divide-zinc-800/50">
                {sessions.map((session, idx) => (
                  <li key={idx} className="p-6 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-lg text-zinc-200">
                          {unitTitleMap[session.chunkId] || session.chunkId}
                        </h3>
                        <p className="text-xs font-mono text-zinc-600 mt-0.5">{session.chunkId}</p>
                        <p className="text-sm text-zinc-500 mt-1">{session.date}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${dodColor(session.dod)}`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {session.dod}
                      </span>
                    </div>
                    {session.bloomLevels && (
                      <p className="text-xs text-zinc-500 mb-3">Уровни Блума: {session.bloomLevels}</p>
                    )}
                    {session.reflection && (
                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800/80">
                        <p className="text-sm text-zinc-300 italic">«{session.reflection}»</p>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
