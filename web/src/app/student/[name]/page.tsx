import { BookOpen, Target, CheckCircle, PlayCircle, Clock } from 'lucide-react'
import Link from 'next/link'
import PrintButton from '@/components/PrintButton'
import { getFileContent } from '@/lib/github'
import { parseSequence, parsePassedFromMyPath } from '@/lib/parsers'

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
  const myPathRaw = await getFileContent(`students/${name}/my-path.md`)
  let passedChunks: string[] = []
  let sessions: Session[] = []

  if (progressRaw) {
    sessions = parseProgressMd(progressRaw)
  }
  if (myPathRaw) {
    passedChunks = parsePassedFromMyPath(myPathRaw)
  } else if (progressRaw) {
    passedChunks = [...new Set(sessions.map(s => s.chunkId))]
  }

  const studentDisplayName = name.charAt(0).toUpperCase() + name.slice(1)

  const dodColor = (dod: string) => {
    const d = dod.toLowerCase()
    if (d.includes('completed') || d.includes('полный')) return 'bg-[#E6F7EE] text-[#007A40] border-[#00A859]/30'
    if (d.includes('progress') || d.includes('минимальный')) return 'bg-[#FFF4E0] text-[#A06A14] border-[#E8A76A]/40'
    return 'bg-[#F5F5F5] text-[#4A4A4A] border-[#D9D9D9]'
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-10 max-w-4xl mx-auto flex justify-between items-start">
        <div>
          <Link href="/student" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block no-print transition-colors">
            ← Назад к выбору профиля
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F7EE] text-[#00A859] rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
            BCC University
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Привет, {studentDisplayName}!</h1>
          <p className="text-[#4A4A4A] mt-2 text-lg">AI Mindset Tracker</p>
        </div>
        <PrintButton />
      </header>

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Progress summary */}
        <div className="bg-white border border-[#D9D9D9] p-6 rounded-[14px] bcc-shadow">
          <h2 className="text-xl font-bold mb-6 flex items-center text-[#1A1A1A]">
            <span className="w-9 h-9 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
            </span>
            Твой прогресс
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 p-5 bg-[#F5F5F5] rounded-[8px] border border-[#D9D9D9]">
              <p className="text-xs uppercase tracking-wider font-semibold text-[#8C8C8C] mb-2">Пройдено чанков</p>
              <p className="text-4xl font-bold text-[#1A1A1A]">{passedChunks.length} <span className="text-lg text-[#8C8C8C] font-normal">/ {units.length}</span></p>
            </div>
            <div className="flex-1 p-5 bg-[#F5F5F5] rounded-[8px] border border-[#D9D9D9]">
              <p className="text-xs uppercase tracking-wider font-semibold text-[#8C8C8C] mb-2">Следующий шаг</p>
              <p className="text-lg font-semibold text-[#00A859]">
                {units.find(u => !passedChunks.includes(u.id))?.title || "Всё пройдено!"}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow no-print">
          <div className="p-6 border-b border-[#D9D9D9] bg-[#F5F5F5]">
            <h2 className="text-xl font-bold flex items-center text-[#1A1A1A]">
              <span className="w-9 h-9 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                <PlayCircle className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
              </span>
              Твой учебный план
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#D9D9D9] before:to-transparent">
              {units.map((unit, idx) => {
                const isPassed = passedChunks.includes(unit.id)
                return (
                  <div key={unit.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${isPassed ? 'bg-[#00A859] text-white' : 'bg-[#F5F5F5] text-[#8C8C8C] border border-[#D9D9D9]'} shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-semibold`}>
                      {isPassed ? <CheckCircle className="w-5 h-5" strokeWidth={2} /> : <span>{idx + 1}</span>}
                    </div>
                    <Link href={`/student/${name}/unit/${unit.id}`} className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-[8px] border transition-colors ${isPassed ? 'bg-[#E6F7EE] border-[#00A859]/30 hover:border-[#00A859]' : 'bg-[#F5F5F5] border-[#D9D9D9] hover:border-[#00A859] hover:bg-white'}`}>
                      <div className="flex justify-between items-start">
                        <h3 className={`font-semibold ${isPassed ? 'text-[#007A40]' : 'text-[#1A1A1A] group-hover:text-[#00A859]'}`}>{unit.title}</h3>
                        <span className="text-xs bg-white border border-[#D9D9D9] px-2 py-1 rounded text-[#4A4A4A] font-medium">{unit.type}</span>
                      </div>
                      <p className="text-xs text-[#8C8C8C] mt-2 font-mono">{unit.id}</p>
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Session history */}
        <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
          <div className="p-6 border-b border-[#D9D9D9] bg-[#F5F5F5]">
            <h2 className="text-xl font-bold flex items-center text-[#1A1A1A]">
              <span className="w-9 h-9 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                <BookOpen className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
              </span>
              История сессий
            </h2>
          </div>
          <div className="p-0">
            {sessions.length === 0 ? (
              <div className="p-8 text-center text-[#8C8C8C]">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" strokeWidth={1.5} />
                <p>Сессий пока нет. Начни первый юнит!</p>
              </div>
            ) : (
              <ul className="divide-y divide-[#D9D9D9]">
                {sessions.map((session, idx) => (
                  <li key={idx} className="p-6 hover:bg-[#F5F5F5] transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg text-[#1A1A1A]">
                          {unitTitleMap[session.chunkId] || session.chunkId}
                        </h3>
                        <p className="text-xs font-mono text-[#8C8C8C] mt-0.5">{session.chunkId}</p>
                        <p className="text-sm text-[#4A4A4A] mt-1">{session.date}</p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${dodColor(session.dod)}`}>
                        <CheckCircle className="w-3 h-3 mr-1" strokeWidth={2} />
                        {session.dod}
                      </span>
                    </div>
                    {session.bloomLevels && (
                      <p className="text-xs text-[#8C8C8C] mb-3">Уровни Блума: <span className="text-[#4A4A4A] font-medium">{session.bloomLevels}</span></p>
                    )}
                    {session.reflection && (
                      <div className="p-4 bg-[#F5F5F5] rounded-[8px] border border-[#D9D9D9]">
                        <p className="text-sm text-[#1A1A1A] italic">«{session.reflection}»</p>
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
