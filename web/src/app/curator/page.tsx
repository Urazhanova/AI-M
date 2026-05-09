import { getDirectoryContent } from '@/lib/github'
import { Users, BookOpen, Activity, UploadCloud } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function Dashboard() {
  const studentsDir = await getDirectoryContent('students')
  const courseDir = await getDirectoryContent('course')

  const studentsCount = Array.isArray(studentsDir) ? studentsDir.filter((f: any) => f.type === 'dir').length : 0
  const chunksCount = Array.isArray(courseDir) ? courseDir.filter((f: any) => f.type === 'dir').length : 0

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 mb-4 inline-block">
            ← Сменить роль
          </Link>
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-zinc-100 to-zinc-400 bg-clip-text text-transparent">Дашборд куратора</h1>
          <p className="text-zinc-400 mt-2 text-lg">Управление программой AI Mindset Tracker</p>
        </div>
        <div className="flex gap-4">
          <Link href="/curator/analytics" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors border border-zinc-700 flex items-center">
            <Activity className="w-4 h-4 mr-2" />
            Аналитика
          </Link>
          <Link href="/student" className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors border border-zinc-700">
            Дашборд студента
          </Link>
          <Link href="/curator/upload" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20 flex items-center">
            <UploadCloud className="w-4 h-4 mr-2" />
            Загрузить транскрипт
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-lg flex items-center hover:border-emerald-500/30 transition-colors">
            <div className="p-4 bg-emerald-500/10 rounded-xl mr-5">
              <Users className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Активных студентов</p>
              <p className="text-3xl font-semibold mt-1">{studentsCount}</p>
            </div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-lg flex items-center hover:border-blue-500/30 transition-colors">
            <div className="p-4 bg-blue-500/10 rounded-xl mr-5">
              <BookOpen className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Учебных чанков</p>
              <p className="text-3xl font-semibold mt-1">{chunksCount}</p>
            </div>
          </div>
          <Link href="/curator/analytics" className="bg-zinc-900 border border-zinc-800/80 p-6 rounded-2xl shadow-lg flex items-center hover:border-purple-500/30 transition-colors cursor-pointer group">
            <div className="p-4 bg-purple-500/10 rounded-xl mr-5 group-hover:bg-purple-500/20 transition-colors">
              <Activity className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-400">Mindset сдвигов</p>
              <p className="text-3xl font-semibold mt-1">Открытая карта</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/50">
              <h2 className="text-xl font-semibold flex items-center">
                Студенты когорты
              </h2>
            </div>
            <div className="p-6">
              {Array.isArray(studentsDir) && studentsDir.length > 0 ? (
                <ul className="space-y-3">
                  {studentsDir.filter((s: any) => s.type === 'dir').map((student: any) => (
                    <li key={student.name}>
                      <Link href={`/curator/student/${student.name}`} className="p-4 bg-zinc-950/50 rounded-xl hover:bg-zinc-800 transition cursor-pointer flex justify-between items-center group border border-zinc-800/50 block">
                        <span className="font-medium text-zinc-200">{student.name}</span>
                        <span className="text-xs px-3 py-1.5 bg-zinc-800 group-hover:bg-zinc-700 rounded-full text-zinc-300 transition-colors">Профиль →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-sm">Не удалось загрузить данные. Проверьте токен GitHub.</p>
              )}
            </div>
          </section>

          <section className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-zinc-800/80 bg-zinc-900/50 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Структура программы (course/)</h2>
              <Link href="/curator/program" className="text-sm px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-300 transition-colors">
                Смотреть граф →
              </Link>
            </div>
            <div className="p-6">
              {Array.isArray(courseDir) && courseDir.length > 0 ? (
                <ul className="space-y-3">
                  {courseDir.filter((c: any) => c.type === 'dir').map((chunk: any) => (
                    <li key={chunk.name} className="p-4 bg-zinc-950/50 rounded-xl hover:bg-zinc-800 transition cursor-pointer border border-zinc-800/50">
                      <span className="font-medium text-sm text-zinc-300 font-mono">{chunk.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-zinc-500 text-sm">Не удалось загрузить чанки.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
