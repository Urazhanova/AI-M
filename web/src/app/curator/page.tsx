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
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-10 max-w-6xl mx-auto flex justify-between items-end">
        <div>
          <Link href="/" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-block transition-colors">
            ← Сменить роль
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F7EE] text-[#00A859] rounded-full text-xs font-semibold uppercase tracking-wider mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
            BCC University
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">Дашборд куратора</h1>
          <p className="text-[#4A4A4A] mt-2 text-lg">Управление программой AI Mindset Tracker</p>
        </div>
        <div className="flex gap-3">
          <Link href="/curator/analytics" className="px-5 py-2.5 bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] rounded-[8px] font-semibold transition-colors border border-[#D9D9D9] flex items-center bcc-shadow">
            <Activity className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Аналитика
          </Link>
          <Link href="/student" className="px-5 py-2.5 bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] rounded-[8px] font-semibold transition-colors border border-[#D9D9D9] bcc-shadow">
            Дашборд студента
          </Link>
          <Link href="/curator/upload" className="px-5 py-2.5 bg-[#00A859] hover:bg-[#007A40] text-white rounded-[8px] font-semibold transition-colors flex items-center bcc-shadow">
            <UploadCloud className="w-4 h-4 mr-2" strokeWidth={1.75} />
            Загрузить транскрипт
          </Link>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[#D9D9D9] p-6 rounded-[14px] bcc-shadow flex items-center hover:border-[#00A859] transition-colors">
            <div className="w-14 h-14 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-5">
              <Users className="w-7 h-7 text-[#00A859]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">Активных студентов</p>
              <p className="text-4xl font-bold mt-1 text-[#1A1A1A]">{studentsCount}</p>
            </div>
          </div>
          <div className="bg-white border border-[#D9D9D9] p-6 rounded-[14px] bcc-shadow flex items-center hover:border-[#00A859] transition-colors">
            <div className="w-14 h-14 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-5">
              <BookOpen className="w-7 h-7 text-[#00A859]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">Учебных чанков</p>
              <p className="text-4xl font-bold mt-1 text-[#1A1A1A]">{chunksCount}</p>
            </div>
          </div>
          <Link href="/curator/analytics" className="bg-white border border-[#D9D9D9] p-6 rounded-[14px] bcc-shadow flex items-center hover:border-[#00A859] transition-colors cursor-pointer group">
            <div className="w-14 h-14 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-5">
              <Activity className="w-7 h-7 text-[#00A859]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#8C8C8C]">Mindset сдвигов</p>
              <p className="text-lg font-semibold mt-1 text-[#00A859]">Открытая карта →</p>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
            <div className="p-6 border-b border-[#D9D9D9] bg-[#F5F5F5]">
              <h2 className="text-xl font-bold flex items-center text-[#1A1A1A]">
                Студенты когорты
              </h2>
            </div>
            <div className="p-6">
              {Array.isArray(studentsDir) && studentsDir.length > 0 ? (
                <ul className="space-y-3">
                  {studentsDir.filter((s: any) => s.type === 'dir').map((student: any) => (
                    <li key={student.name}>
                      <Link href={`/curator/student/${student.name}`} className="p-4 bg-[#F5F5F5] rounded-[8px] hover:bg-[#E6F7EE] transition cursor-pointer flex justify-between items-center group border border-transparent hover:border-[#00A859] block">
                        <span className="font-semibold text-[#1A1A1A] capitalize">{student.name}</span>
                        <span className="text-xs px-3 py-1.5 bg-white group-hover:bg-[#00A859] group-hover:text-white rounded-full text-[#4A4A4A] transition-colors border border-[#D9D9D9] group-hover:border-[#00A859]">Профиль →</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#8C8C8C] text-sm">Не удалось загрузить данные. Проверьте токен GitHub.</p>
              )}
            </div>
          </section>

          <section className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow">
            <div className="p-6 border-b border-[#D9D9D9] bg-[#F5F5F5] flex justify-between items-center">
              <h2 className="text-xl font-bold text-[#1A1A1A]">Структура программы</h2>
              <Link href="/curator/program" className="text-sm px-3 py-1.5 bg-white hover:bg-[#E6F7EE] hover:text-[#00A859] rounded-[8px] text-[#4A4A4A] font-medium transition-colors border border-[#D9D9D9]">
                Смотреть граф →
              </Link>
            </div>
            <div className="p-6">
              {Array.isArray(courseDir) && courseDir.length > 0 ? (
                <ul className="space-y-3">
                  {courseDir.filter((c: any) => c.type === 'dir').map((chunk: any) => (
                    <li key={chunk.name} className="p-4 bg-[#F5F5F5] rounded-[8px] hover:bg-[#E6F7EE] transition cursor-pointer border border-transparent hover:border-[#00A859]">
                      <span className="font-medium text-sm text-[#1A1A1A] font-mono">{chunk.name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-[#8C8C8C] text-sm">Не удалось загрузить чанки.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
