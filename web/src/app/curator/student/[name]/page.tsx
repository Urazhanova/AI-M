import { getFileContent, getDirectoryContent } from '@/lib/github'
import { CheckCircle, Clock, BookOpen, BrainCircuit, Play } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function StudentProfile({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params

  const progressContent = await getFileContent(`students/${name}/progress.md`)

  const courseDir = await getDirectoryContent('course')
  const allChunks = Array.isArray(courseDir) ? courseDir.filter((c: any) => c.type === 'dir').map((c: any) => c.name) : []

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-10 max-w-6xl mx-auto">
        <Link href="/curator" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block transition-colors">
          ← Назад к дашборду
        </Link>
        <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A] capitalize">Профиль: {name}</h1>
        <p className="text-[#4A4A4A] mt-2 text-lg">AI Mindset Tracker</p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

        {/* Левая колонка */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
            <div className="p-6 border-b border-[#D9D9D9] bg-[#F5F5F5]">
              <h2 className="text-xl font-bold flex items-center text-[#1A1A1A]">
                <span className="w-9 h-9 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                  <BookOpen className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
                </span>
                Лог прогресса (progress.md)
              </h2>
            </div>
            <div className="p-6">
              {progressContent ? (
                <div className="prose prose-zinc max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-sm text-[#1A1A1A] bg-transparent p-0 m-0 border-0">
                    {progressContent}
                  </pre>
                </div>
              ) : (
                <div className="text-center p-8 border-2 border-dashed border-[#D9D9D9] rounded-[8px]">
                  <p className="text-[#8C8C8C]">Файл прогресса пока пуст или не найден.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Правая колонка */}
        <div className="space-y-8">
          <section className="bg-white border border-[#D9D9D9] rounded-[14px] bcc-shadow overflow-hidden">
            <div className="p-6 border-b border-[#D9D9D9] bg-[#F5F5F5]">
              <h2 className="text-xl font-bold flex items-center text-[#1A1A1A]">
                <span className="w-9 h-9 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                  <ActivityIcon className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
                </span>
                Учебные сессии
              </h2>
            </div>
            <div className="p-4">
              <ul className="space-y-3">
                {allChunks.map((chunk) => {
                  const isCompleted = progressContent && progressContent.includes(`Сессия: ${chunk}`) && progressContent.includes('Completed')

                  return (
                    <li key={chunk} className="flex flex-col p-3 bg-[#F5F5F5] rounded-[8px] border border-[#D9D9D9]">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          {isCompleted ? (
                            <CheckCircle className="w-4 h-4 text-[#00A859] mr-2 flex-shrink-0" strokeWidth={2} />
                          ) : (
                            <Clock className="w-4 h-4 text-[#8C8C8C] mr-2 flex-shrink-0" strokeWidth={1.75} />
                          )}
                          <span className={`font-mono text-sm ${isCompleted ? 'text-[#007A40] font-semibold' : 'text-[#4A4A4A]'}`}>{chunk}</span>
                        </div>
                      </div>
                      <Link
                        href={`/curator/session/${name}/${chunk}`}
                        className="flex items-center justify-center w-full py-2 bg-[#00A859] hover:bg-[#007A40] text-white text-xs font-semibold rounded-[8px] transition-colors"
                      >
                        <Play className="w-3 h-3 mr-1.5" strokeWidth={2} />
                        Провести сессию
                      </Link>
                    </li>
                  )
                })}
              </ul>
              {allChunks.length === 0 && (
                <p className="text-[#8C8C8C] text-sm text-center">Чанки не найдены.</p>
              )}
            </div>
          </section>

          <section className="bg-white border border-[#D9D9D9] rounded-[14px] bcc-shadow p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center text-[#1A1A1A]">
              <span className="w-9 h-9 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-3">
                <BrainCircuit className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
              </span>
              Mindset статусы
            </h2>
            <div className="space-y-4">
              <div className="text-sm text-[#4A4A4A] pb-2 border-b border-[#D9D9D9]">
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
      strokeWidth={props.strokeWidth ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  )
}
