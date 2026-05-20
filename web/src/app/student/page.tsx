import Link from 'next/link'
import { UserCircle2 } from 'lucide-react'

export default function StudentSelectionPage() {
  const students = [
    { id: 'irina', name: 'Ирина', role: 'Product Manager' },
    { id: 'vadim', name: 'Вадим', role: 'Team Lead' },
    { id: 'masha', name: 'Маша', role: 'Designer' }
  ]

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-8">
      <Link href="/" className="absolute top-8 left-8 text-sm text-[#8C8C8C] hover:text-[#00A859] transition-colors">
        ← Назад к выбору роли
      </Link>

      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#E6F7EE] text-[#00A859] rounded-full text-xs font-semibold uppercase tracking-wider mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00A859]"></span>
          AI Mindset Tracker
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[#1A1A1A]">
          Кто вы?
        </h1>
        <p className="text-[#4A4A4A] mt-3">Выберите свой профиль для продолжения обучения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {students.map(student => (
          <Link
            key={student.id}
            href={`/student/${student.id}`}
            className="group bg-white border border-[#D9D9D9] hover:border-[#00A859] rounded-[14px] p-6 transition-all bcc-shadow bcc-shadow-hover flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-[#E6F7EE] rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <UserCircle2 className="w-8 h-8 text-[#00A859]" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-[#1A1A1A] mb-1">{student.name}</h2>
            <p className="text-sm text-[#8C8C8C]">{student.role}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
