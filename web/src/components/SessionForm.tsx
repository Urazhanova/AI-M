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
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-lg space-y-6">
      <h2 className="text-xl font-semibold mb-4">Закрытие сессии</h2>
      
      {/* Bloom Levels */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">Достигнутые уровни Блума:</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {BLOOM_LEVELS.map(level => (
            <label key={level} className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${selectedBloom.includes(level) ? 'bg-blue-500/10 border-blue-500/50 text-blue-300' : 'bg-zinc-950/50 border-zinc-800 hover:border-zinc-700'}`}>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={selectedBloom.includes(level)}
                onChange={() => toggleBloom(level)}
              />
              <div className={`w-4 h-4 rounded-sm border mr-3 flex items-center justify-center ${selectedBloom.includes(level) ? 'border-blue-500 bg-blue-500' : 'border-zinc-600'}`}>
                {selectedBloom.includes(level) && <CheckCircle className="w-3 h-3 text-white" />}
              </div>
              <span className="text-sm">{level}</span>
            </label>
          ))}
        </div>
      </div>

      {/* DoD Status */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Статус DoD (Definition of Done):</label>
        <select 
          value={dodStatus}
          onChange={(e) => setDodStatus(e.target.value)}
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="Completed">Completed (Пройдено)</option>
          <option value="In Progress">In Progress (В процессе)</option>
          <option value="Blocked">Blocked (Заблокировано)</option>
          <option value="Needs Review">Needs Review (Требует проверки)</option>
        </select>
      </div>

      {/* Reflection */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-2">Заметки и рефлексия (обязательно):</label>
        <textarea 
          required
          rows={4}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder="Опишите, как прошла сессия, какие были инсайты или трудности..."
          className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-y"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button 
          type="submit" 
          disabled={isSubmitting || reflection.trim().length === 0}
          className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:shadow-none"
        >
          {isSubmitting ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Сохранение...</>
          ) : (
            'Завершить сессию и сохранить (Commit)'
          )}
        </button>
      </div>

      {/* Status Messages */}
      {status.type === 'success' && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-start">
          <CheckCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{status.message}</p>
        </div>
      )}
      {status.type === 'error' && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-start">
          <AlertCircle className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{status.message}</p>
        </div>
      )}
    </form>
  )
}
