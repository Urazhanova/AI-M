import { getFileContent } from '@/lib/github'
import { parseSequence } from '@/lib/parsers'
import SessionForm from '@/components/SessionForm'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import Link from 'next/link'
import { BookOpen, HelpCircle } from 'lucide-react'

export default async function SessionPage({ params }: { params: Promise<{ studentName: string, chunkId: string }> }) {
  const { studentName, chunkId } = await params

  const sequenceRaw = await getFileContent('course/sequence.md')
  const units = sequenceRaw ? parseSequence(sequenceRaw) : []
  const currentUnit = units.find(u => u.id === chunkId)
  const unitTitle = currentUnit ? currentUnit.title : chunkId

  const contentMd = await getFileContent(`course/${chunkId}/content.md`)
  const metaMd = await getFileContent(`course/${chunkId}/meta.md`)

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-8 max-w-7xl mx-auto">
        <Link href={`/curator/student/${studentName}`} className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block transition-colors">
          ← Назад к профилю <span className="capitalize">{studentName}</span>
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Учебная сессия: {unitTitle}</h1>
        <div className="flex gap-4 mt-2 text-[#4A4A4A]">
          <p>Студент: <span className="text-[#1A1A1A] font-semibold capitalize">{studentName}</span></p>
          <p>Юнит: <span className="font-mono text-[#1A1A1A]">{chunkId}</span></p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Left Column: Material and Questions */}
        <div className="lg:col-span-2 space-y-8">

          {/* Content.md */}
          <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
            <div className="p-4 border-b border-[#D9D9D9] bg-[#F5F5F5] flex items-center">
              <span className="w-8 h-8 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                <BookOpen className="w-4 h-4 text-[#00A859]" strokeWidth={1.75} />
              </span>
              <h2 className="font-bold text-[#1A1A1A]">Материал (content.md)</h2>
            </div>
            <div className="p-6 prose prose-zinc max-w-none prose-headings:text-[#1A1A1A] prose-a:text-[#00A859] prose-strong:text-[#1A1A1A]">
              {contentMd ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contentMd}
                </ReactMarkdown>
              ) : (
                <p className="text-[#8C8C8C] not-prose">Не удалось загрузить материал. Возможно, файл отсутствует.</p>
              )}
            </div>
          </section>

          {/* Meta.md */}
          <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
            <div className="p-4 border-b border-[#D9D9D9] bg-[#F5F5F5] flex items-center">
              <span className="w-8 h-8 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                <HelpCircle className="w-4 h-4 text-[#00A859]" strokeWidth={1.75} />
              </span>
              <h2 className="font-bold text-[#1A1A1A]">Вопросы и метаданные (meta.md)</h2>
            </div>
            <div className="p-6 prose prose-zinc max-w-none prose-headings:text-[#1A1A1A] prose-a:text-[#00A859] prose-strong:text-[#1A1A1A]">
              {metaMd ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {metaMd}
                </ReactMarkdown>
              ) : (
                <p className="text-[#8C8C8C] not-prose">Файл метаданных отсутствует.</p>
              )}
            </div>
          </section>

        </div>

        {/* Right Column: Closing Form */}
        <div className="lg:sticky lg:top-8">
          <SessionForm studentName={studentName} chunkId={chunkId} />
        </div>

      </div>
    </div>
  )
}
