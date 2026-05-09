import Link from 'next/link'
import { UserCircle2 } from 'lucide-react'

export default function StudentSelectionPage() {
  const students = [
    { id: 'irina', name: 'Ирина', role: 'Product Manager' },
    { id: 'vadim', name: 'Вадим', role: 'Team Lead' },
    { id: 'masha', name: 'Маша', role: 'Designer' }
  ]

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-8">
      <Link href="/" className="absolute top-8 left-8 text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
        ← Назад к выбору роли
      </Link>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-100">
          Кто вы?
        </h1>
        <p className="text-zinc-400 mt-3">Выберите свой профиль для продолжения обучения</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full">
        {students.map(student => (
          <Link 
            key={student.id}
            href={`/student/${student.id}`}
            className="group bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 rounded-2xl p-6 transition-all hover:bg-zinc-800/50 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <UserCircle2 className="w-8 h-8 text-zinc-400 group-hover:text-blue-400 transition-colors" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-200 mb-1">{student.name}</h2>
            <p className="text-sm text-zinc-500">{student.role}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
