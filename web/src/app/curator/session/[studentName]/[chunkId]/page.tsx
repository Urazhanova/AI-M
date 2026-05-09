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

  // Fetch materials
  const contentMd = await getFileContent(`course/${chunkId}/content.md`)
  const metaMd = await getFileContent(`course/${chunkId}/meta.md`)

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-8 max-w-7xl mx-auto">
        <Link href={`/curator/student/${studentName}`} className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Назад к профилю {studentName}
        </Link>
        <h1 className="text-3xl font-bold tracking-tight">Учебная сессия: {unitTitle}</h1>
        <div className="flex gap-4 mt-2 text-zinc-400">
          <p>Студент: <span className="text-zinc-200 font-medium">{studentName}</span></p>
          <p>Юнит: <span className="font-mono">{chunkId}</span></p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Material and Questions */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Content.md */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center">
              <BookOpen className="w-5 h-5 mr-3 text-emerald-400" />
              <h2 className="font-semibold">Материал (content.md)</h2>
            </div>
            <div className="p-6 prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-200 prose-a:text-blue-400">
              {contentMd ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {contentMd}
                </ReactMarkdown>
              ) : (
                <p className="text-zinc-500 not-prose">Не удалось загрузить материал. Возможно, файл отсутствует.</p>
              )}
            </div>
          </section>

          {/* Meta.md */}
          <section className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-4 border-b border-zinc-800 bg-zinc-900/50 flex items-center">
              <HelpCircle className="w-5 h-5 mr-3 text-amber-400" />
              <h2 className="font-semibold">Вопросы и метаданные (meta.md)</h2>
            </div>
            <div className="p-6 prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-200 prose-a:text-blue-400">
              {metaMd ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {metaMd}
                </ReactMarkdown>
              ) : (
                <p className="text-zinc-500 not-prose">Файл метаданных отсутствует.</p>
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
