import { getFileContent } from '@/lib/github'
import { parseSequence } from '@/lib/parsers'
import ProgramGraph from '@/components/ProgramGraph'
import Link from 'next/link'

export default async function ProgramPage() {
  const sequenceRaw = await getFileContent('course/sequence.md')
  const sequenceNodes = sequenceRaw ? parseSequence(sequenceRaw) : []

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-8 max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <Link href="/curator" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block transition-colors">
            ← Назад к дашборду
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">Структура программы</h1>
          <p className="text-[#4A4A4A] mt-2">Визуализация графа чанков из sequence.md</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {sequenceNodes.length > 0 ? (
          <ProgramGraph sequenceNodes={sequenceNodes} />
        ) : (
          <div className="p-12 border-2 border-dashed border-[#D9D9D9] rounded-[14px] text-center bg-white">
            <p className="text-[#4A4A4A] mb-2 font-medium">Не удалось загрузить граф.</p>
            <p className="text-sm text-[#8C8C8C]">Проверьте, существует ли файл course/sequence.md с валидным YAML.</p>
          </div>
        )}
      </div>
    </div>
  )
}
