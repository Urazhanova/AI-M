import Link from 'next/link'
import { GraduationCap, Briefcase } from 'lucide-react'

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F7EE] text-[#00A859] rounded-full text-xs font-semibold uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
          BCC University
        </div>
        <h1 className="text-5xl font-bold tracking-tight text-[#1A1A1A]">
          AI Mindset Tracker
        </h1>
        <p className="text-[#4A4A4A] mt-4 text-lg">Выберите вашу роль для входа в систему</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Студент */}
        <Link
          href="/student"
          className="group relative bg-white border border-[#D9D9D9] hover:border-[#00A859] rounded-[20px] p-8 transition-all bcc-shadow bcc-shadow-hover flex flex-col items-center text-center overflow-hidden"
        >
          <div className="w-20 h-20 bg-[#E6F7EE] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <GraduationCap className="w-10 h-10 text-[#00A859]" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Я Студент</h2>
          <p className="text-[#4A4A4A]">
            Перейти к учебным материалам, отслеживать свой прогресс и общаться с AI-Тьютором.
          </p>
        </Link>

        {/* Куратор */}
        <Link
          href="/curator"
          className="group relative bg-white border border-[#D9D9D9] hover:border-[#00A859] rounded-[20px] p-8 transition-all bcc-shadow bcc-shadow-hover flex flex-col items-center text-center overflow-hidden"
        >
          <div className="w-20 h-20 bg-[#E6F7EE] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Briefcase className="w-10 h-10 text-[#00A859]" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">Я Куратор</h2>
          <p className="text-[#4A4A4A]">
            Управление когортой, проверка результатов сессий и анализ динамики mindset-сдвигов.
          </p>
        </Link>
      </div>
    </div>
  )
}
