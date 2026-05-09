import { getFileContent } from '@/lib/github'
import { parseSequence } from '@/lib/parsers'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import AITutorChat from '@/components/AITutorChat'

export const dynamic = 'force-dynamic'

export default async function StudentUnitPage({ params }: { params: Promise<{ name: string, chunkId: string }> }) {
  const { name, chunkId } = await params
  
  const sequenceRaw = await getFileContent('course/sequence.md')
  const units = sequenceRaw ? parseSequence(sequenceRaw) : []
  const currentUnit = units.find(u => u.id === chunkId)
  const unitTitle = currentUnit ? currentUnit.title : chunkId

  const contentRaw = await getFileContent(`course/${chunkId}/content.md`) || 'Материал не найден.'
  const metaRaw = await getFileContent(`course/${chunkId}/meta.md`) || 'Метаданные не найдены.'

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-8 max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <Link href={`/student/${name}`} className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Вернуться к списку юнитов
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{unitTitle}</h1>
          <p className="text-zinc-500 mt-2 font-mono text-sm">Юнит: {chunkId}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Material (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center text-zinc-300 font-medium text-sm">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
              Учебный материал
            </div>
            <div className="p-8 prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-100 prose-a:text-blue-400">
              <ReactMarkdown>{contentRaw}</ReactMarkdown>
            </div>
          </div>
        </div>

        {/* Right Column: AI Tutor Chat (1/3 width) */}
        <div className="lg:col-span-1">
          <AITutorChat studentName={name} chunkId={chunkId} metaContent={metaRaw} />
        </div>
      </div>
    </div>
  )
}
