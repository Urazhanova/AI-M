'use client'

import { useState } from 'react'
import { submitSessionResult } from '@/app/actions'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface SessionFormProps {
  studentName: string
  chunkId: string
}

const BLOOM_LEVELS = [
  'Knowledge (Знание)',
  'Comprehension (Понимание)',
  'Application (Применение)',
  'Analysis (Анализ)',
  'Synthesis (Синтез)',
  'Evaluation (Оценка)'
]

export default function SessionForm({ studentName, chunkId }: SessionFormProps) {
  const [dodStatus, setDodStatus] = useState('In Progress')
  const [reflection, setReflection] = useState('')
  const [selectedBloom, setSelectedBloom] = useState<string[]>([])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState<{type: 'idle' | 'success' | 'error', message: string}>({ type: 'idle', message: '' })

  const toggleBloom = (level: string) => {
    setSelectedBloom(prev =>
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setStatus({ type: 'idle', message: '' })

    const result = await submitSessionResult(studentName, chunkId, dodStatus, reflection, selectedBloom)

    setIsSubmitting(false)
    if (result.success) {
      setStatus({ type: 'success', message: 'Сессия успешно сохранена! Коммит отправлен в ветку main.' })
      setReflection('')
      setSelectedBloom([])
    } else {
      setStatus({ type: 'error', message: result.error || 'Произошла ошибка при сохранении.' })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-[#D9D9D9] rounded-[14px] p-6 bcc-shadow space-y-6">
      <h2 className="text-xl font-bold mb-4 text-[#1A1A1A]">Закрытие сессии</h2>

      {/* Bloom Levels */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-3">Достигнутые уровни Блума:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BLOOM_LEVELS.map(level => (
            <label key={level} className={`flex items-center p-3 rounded-[8px] border cursor-pointer transition-colors ${selectedBloom.includes(level) ? 'bg-[#E6F7EE] border-[#00A859] text-[#007A40]' : 'bg-[#F5F5F5] border-[#D9D9D9] hover:border-[#00A859]/50 text-[#1A1A1A]'}`}>
              <input
                type="checkbox"
                className="hidden"
                checked={selectedBloom.includes(level)}
                onChange={() => toggleBloom(level)}
              />
              <div className={`w-4 h-4 rounded-sm border mr-3 flex items-center justify-center ${selectedBloom.includes(level) ? 'border-[#00A859] bg-[#00A859]' : 'border-[#8C8C8C] bg-white'}`}>
                {selectedBloom.includes(level) && <CheckCircle className="w-3 h-3 text-white" strokeWidth={2.5} />}
              </div>
              <span className="text-sm font-medium">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* DoD Status */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Статус DoD (Definition of Done):</label>
        <select
          value={dodStatus}
          onChange={(e) => setDodStatus(e.target.value)}
          className="w-full bg-white border border-[#D9D9D9] rounded-[8px] px-4 py-3 text-[#1A1A1A] focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859]"
        >
          <option value="Completed">Completed (Пройдено)</option>
          <option value="In Progress">In Progress (В процессе)</option>
          <option value="Blocked">Blocked (Заблокировано)</option>
          <option value="Needs Review">Needs Review (Требует проверки)</option>
        </select>
      </div>

      {/* Reflection */}
      <div>
        <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">Заметки и рефлексия (обязательно):</label>
        <textarea
          required
          rows={4}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Опишите, как прошла сессия, какие были инсайты или трудности..."
          className="w-full bg-white border border-[#D9D9D9] rounded-[8px] px-4 py-3 text-[#1A1A1A] placeholder-[#8C8C8C] focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] resize-y"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting || reflection.trim().length === 0}
          className="w-full flex items-center justify-center px-6 py-3 bg-[#00A859] hover:bg-[#007A40] disabled:bg-[#D9D9D9] disabled:text-[#8C8C8C] disabled:cursor-not-allowed text-white font-semibold rounded-[8px] transition-all"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={2} /> Сохранение...</>
          ) : (
            'Завершить сессию и сохранить'
          )}
        </button>
      </div>

      {/* Status Messages */}
      {status.type === 'success' && (
        <div className="p-4 bg-[#E6F7EE] border border-[#00A859]/30 text-[#007A40] rounded-[8px] flex items-start">
          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}
      {status.type === 'error' && (
        <div className="p-4 bg-[#9B1D27]/10 border border-[#9B1D27]/30 text-[#9B1D27] rounded-[8px] flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" strokeWidth={1.75} />
          <p className="text-sm font-medium">{status.message}</p>
        </div>
      )}
    </form>
  )
}
