import { getFileContent, getDirectoryContent } from '@/lib/github'
import { CheckCircle, Clock, BookOpen, BrainCircuit, Play } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StudentProfile({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params
  
  // Попробуем прочитать прогресс студента
  const progressContent = await getFileContent(`students/${name}/progress.md`)
  
  // Читаем список всех чанков
  const courseDir = await getDirectoryContent('course')
  const allChunks = Array.isArray(courseDir) ? courseDir.filter((c: any) => c.type === 'dir').map((c: any) => c.name) : []

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-10 max-w-6xl mx-auto">
        <Link href="/" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-block">
          ← Назад к дашборду
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">Профиль: {name}</h1>
        <p className="text-zinc-400 mt-2 text-lg">AI Mindset Tracker</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/50">
              <h2 className="text-xl font-semibold flex items-center">
                <BookOpen className="w-5 h-5 mr-3 text-emerald-400" />
                Лог прогресса (progress.md)
              </h2>
            </div>
            <div className="p-6">
              {progressContent ? (
                <div className="prose prose-invert prose-zinc max-w-none">
                  {/* Простой вывод текста, но сохраняющий форматирование */}
                  <pre className="whitespace-pre-wrap font-sans text-sm text-zinc-300 bg-transparent p-0 m-0 border-0">
                    {progressContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-zinc-800 rounded-xl">
                  <p className="text-zinc-500">Файл прогресса пока пуст или не найден.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Правая колонка */}
        <div className="space-y-8">
          <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/50">
              <h2 className="text-xl font-semibold flex items-center">
                <ActivityIcon className="w-5 h-5 mr-3 text-blue-400" />
                Учебные сессии
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {allChunks.map((chunk) => {
                  // Очень примитивная проверка пройден ли чанк (поиск по логу)
                  const isCompleted = progressContent && progressContent.includes(`Сессия: ${chunk}`) && progressContent.includes('Completed')
                  
                  return (
                    <li key={chunk} className="flex flex-col p-3 bg-zinc-950/50 rounded-xl border border-zinc-800/50">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 flex-shrink-0" />
                          ) : (
                            <Clock className="w-4 h-4 text-zinc-600 mr-2 flex-shrink-0" />
                          )}
                          <span className={`font-mono text-sm ${isCompleted ? 'text-zinc-300' : 'text-zinc-400'}`}>{chunk}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/curator/session/${name}/${chunk}`}
                        className="flex items-center justify-center w-full py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium rounded-lg transition-colors border border-blue-500/20"
                      >
                        <Play className="w-3 h-3 mr-1.5" />
                        Провести сессию
                      </Link>
                    </li>
                  )
                })}
              </ul>
              {allChunks.length === 0 && (
                <p className="text-zinc-500 text-sm text-center">Чанки не найдены.</p>
              )}
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <BrainCircuit className="w-5 h-5 mr-3 text-purple-400" />
              Mindset статусы
            </h2>
            <div className="space-y-4">
              <div className="text-sm text-zinc-400 pb-2 border-b border-zinc-800">
                Полная карта сдвигов доступна на Дашборде.
              </div>
            </div>
          </section>
        </div>

      </div>
    </div>
  )
}

function ActivityIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
