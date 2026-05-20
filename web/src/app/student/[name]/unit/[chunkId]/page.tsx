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
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-8 max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <Link href={`/student/${name}`} className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block transition-colors">
            ← Вернуться к списку юнитов
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">{unitTitle}</h1>
          <p className="text-[#8C8C8C] mt-2 font-mono text-sm">Юнит: {chunkId}</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Material (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
            <div className="p-4 border-b border-[#D9D9D9] bg-[#F5F5F5] flex items-center text-[#1A1A1A] font-semibold text-sm">
              <span className="w-2 h-2 rounded-full bg-[#00A859] mr-2"></span>
              Учебный материал
            </div>
            <div className="p-8 prose prose-zinc max-w-none prose-headings:text-[#1A1A1A] prose-a:text-[#00A859] prose-strong:text-[#1A1A1A]">
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
