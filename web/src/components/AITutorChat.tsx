'use client'

import { useState, useRef, useEffect } from 'react'
import { verifyKnowledge } from '@/app/actions'
import { Send, Bot, User, CheckCircle, Loader2, StopCircle } from 'lucide-react'

type Message = {
  role: 'user' | 'model'
  text: string
}

export default function AITutorChat({ studentName, chunkId, metaContent }: { studentName: string, chunkId: string, metaContent: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: `Привет! Я твой AI-тьютор. Давай проверим, как ты усвоил материал юнита **${chunkId}**. Прочитай материал слева и скажи, когда будешь готов начать, или сразу напиши свои главные инсайты!` }
  ])
  const [input, setInput] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSessionEnded, setIsSessionEnded] = useState(false)
  const [achievedLevels, setAchievedLevels] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isVerifying])

  const handleSend = async (isManualEnd: boolean = false) => {
    if (!input.trim() && !isManualEnd) return

    const userMessageText = input.trim()
    const currentHistory = [...messages]
    
    if (!isManualEnd) {
      const newUserMsg: Message = { role: 'user', text: userMessageText }
      setMessages(prev => [...prev, newUserMsg])
    }
    
    setInput('')
    setIsVerifying(true)
    setError(null)

    // To prevent sending the very first greeting as history (since it was just hardcoded and Gemini expects strictly user-first or alternating).
    // Actually, gemini startChat works fine if history starts with model or user. 
    // We will just pass everything except the new message as history.
    
    const res = await verifyKnowledge(studentName, chunkId, metaContent, currentHistory, userMessageText, isManualEnd)
    
    if (res.success) {
      setMessages(prev => [...prev, { role: 'model' as const, text: res.text ?? '' }])
      
      if (res.isSessionEnded) {
        setIsSessionEnded(true)
        if (res.achievedBloomLevels) {
          setAchievedLevels(res.achievedBloomLevels)
        }
      }
    } else {
      setError(res.error || 'Произошла ошибка при верификации.')
    }
    
    setIsVerifying(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSend(false)
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[600px] sticky top-8">
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center mr-3">
            <Bot className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-100">AI-Тьютор</h2>
            <p className="text-xs text-zinc-400">Верификация знаний (Gemini)</p>
          </div>
        </div>
        {!isSessionEnded && messages.length > 1 && (
          <button 
            onClick={() => handleSend(true)}
            disabled={isVerifying}
            className="flex items-center text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-colors border border-red-500/20"
            title="Завершить тест и подвести итоги досрочно"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" />
            Завершить
          </button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-blue-600/20'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-300" /> : <Bot className="w-4 h-4 text-blue-400" />}
            </div>
            <div className={`rounded-2xl p-4 text-sm max-w-[85%] ${
              msg.role === 'user' 
                ? 'bg-blue-600/20 border border-blue-500/30 text-zinc-200 rounded-tr-sm' 
                : 'bg-zinc-800/80 text-zinc-300 rounded-tl-sm'
            }`}>
              {msg.text.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
            </div>
          </div>
        ))}
        
        {isVerifying && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex-shrink-0 flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm p-4 text-sm text-zinc-300 flex items-center">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-blue-400" />
              <span>Тьютор печатает...</span>
            </div>
          </div>
        )}

        {isSessionEnded && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 flex-shrink-0 flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-zinc-800/80 rounded-2xl rounded-tl-sm p-4 text-sm text-zinc-300 w-full">
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 mb-4">
                <p className="text-xs text-zinc-500 mb-2 uppercase font-semibold">Достигнутые уровни Блума:</p>
                <div className="flex flex-wrap gap-2">
                  {achievedLevels.length > 0 ? (
                    achievedLevels.map((lvl: string) => (
                      <span key={lvl} className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded text-xs border border-blue-500/20">
                        {lvl}
                      </span>
                    ))
                  ) : (
                    <span className="text-zinc-500 text-xs">Уровни не достигнуты</span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
                <CheckCircle className="w-5 h-5 mr-2" />
                <span className="font-medium">Сессия завершена. Прогресс сохранен.</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-zinc-800 bg-zinc-900/50">
        {!isSessionEnded ? (
          <form onSubmit={handleSubmit} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend(false)
                }
              }}
              disabled={isVerifying}
              placeholder="Напишите ответ (Enter - отправить)..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-3 px-4 pr-12 text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-none h-20"
            />
            <button
              type="submit"
              disabled={isVerifying || !input.trim()}
              className="absolute bottom-3 right-3 p-2 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-800 disabled:text-zinc-500 text-white rounded-lg transition-colors"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </form>
        ) : (
          <button 
            onClick={() => window.location.href = `/student/${studentName}`}
            className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl text-sm font-medium transition-colors"
          >
            Вернуться к списку юнитов
          </button>
        )}
      </div>
    </div>
  )
}

