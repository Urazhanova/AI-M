import { getFileContent } from '@/lib/github'
import { parseSequence } from '@/lib/parsers'
import ProgramGraph from '@/components/ProgramGraph'
import Link from 'next/link'

export default async function ProgramPage() {
  const sequenceRaw = await getFileContent('course/sequence.md')
  const sequenceNodes = sequenceRaw ? parseSequence(sequenceRaw) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-8 max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <Link href="/curator" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
            ← Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Структура программы</h1>
          <p className="text-zinc-400 mt-2">Визуализация графа чанков из sequence.md</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {sequenceNodes.length > 0 ? (
          <ProgramGraph sequenceNodes={sequenceNodes} />
        ) : (
          <div className="p-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center">
            <p className="text-zinc-500 mb-2">Не удалось загрузить граф.</p>
            <p className="text-sm text-zinc-600">Проверьте, существует ли файл course/sequence.md с валидным YAML.</p>
          </div>
        )}
      </div>
    </div>
  )
}
