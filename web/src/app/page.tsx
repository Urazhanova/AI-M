import Link from 'next/link'
import { GraduationCap, Briefcase } from 'lucide-react'

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          AI Mindset Tracker
        </h1>
        <p className="text-zinc-400 mt-4 text-lg">Выберите вашу роль для входа в систему</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full">
        {/* Студент */}
        <Link 
          href="/student"
          className="group relative bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-3xl p-8 transition-all hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)] flex flex-col items-center text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <GraduationCap className="w-10 h-10 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Я Студент</h2>
          <p className="text-zinc-400">
            Перейти к учебным материалам, отслеживать свой прогресс и общаться с AI-Тьютором.
          </p>
        </Link>

        {/* Куратор */}
        <Link 
          href="/curator"
          className="group relative bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-3xl p-8 transition-all hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)] flex flex-col items-center text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
            <Briefcase className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100 mb-3">Я Куратор</h2>
          <p className="text-zinc-400">
            Управление когортой, проверка результатов сессий и анализ динамики mindset-сдвигов.
          </p>
        </Link>
      </div>
    </div>
  )
}
