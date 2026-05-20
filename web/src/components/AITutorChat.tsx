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
    <div className="bg-white border border-[#D9D9D9] rounded-[14px] overflow-hidden bcc-shadow flex flex-col h-[600px] sticky top-8">
      <div className="p-4 border-b border-[#D9D9D9] bg-[#F5F5F5] flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-[#E6F7EE] flex items-center justify-center mr-3">
            <Bot className="w-5 h-5 text-[#00A859]" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="font-bold text-[#1A1A1A]">AI-Тьютор</h2>
            <p className="text-xs text-[#8C8C8C]">Верификация знаний</p>
          </div>
        </div>
        {!isSessionEnded && messages.length > 1 && (
          <button
            onClick={() => handleSend(true)}
            disabled={isVerifying}
            className="flex items-center text-xs text-[#9B1D27] hover:bg-[#9B1D27]/10 px-3 py-1.5 rounded-[8px] transition-colors border border-[#9B1D27]/30 font-medium"
            title="Завершить тест и подвести итоги досрочно"
          >
            <StopCircle className="w-3.5 h-3.5 mr-1" strokeWidth={1.75} />
            Завершить
          </button>
        )}
      </div>

      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-[#F5F5F5] border border-[#D9D9D9]' : 'bg-[#E6F7EE]'}`}>
              {msg.role === 'user' ? <User className="w-4 h-4 text-[#4A4A4A]" strokeWidth={1.75} /> : <Bot className="w-4 h-4 text-[#00A859]" strokeWidth={1.75} />}
            </div>
            <div className={`rounded-[14px] p-4 text-sm max-w-[85%] ${
              msg.role === 'user'
                ? 'bg-[#00A859] text-white rounded-tr-sm'
                : 'bg-[#F5F5F5] text-[#1A1A1A] rounded-tl-sm border border-[#D9D9D9]'
            }`}>
              {msg.text.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0">{line}</p>)}
            </div>
          </div>
        ))}

        {isVerifying && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6F7EE] flex-shrink-0 flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-[#00A859]" strokeWidth={1.75} />
            </div>
            <div className="bg-[#F5F5F5] rounded-[14px] rounded-tl-sm p-4 text-sm text-[#4A4A4A] flex items-center border border-[#D9D9D9]">
              <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#00A859]" strokeWidth={2} />
              <span>Тьютор печатает...</span>
            </div>
          </div>
        )}

        {isSessionEnded && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-[#E6F7EE] flex-shrink-0 flex items-center justify-center mt-1">
              <Bot className="w-4 h-4 text-[#00A859]" strokeWidth={1.75} />
            </div>
            <div className="bg-[#F5F5F5] rounded-[14px] rounded-tl-sm p-4 text-sm text-[#1A1A1A] w-full border border-[#D9D9D9]">
              <div className="bg-white rounded-[8px] p-3 border border-[#D9D9D9] mb-4">
                <p className="text-xs text-[#8C8C8C] mb-2 uppercase font-semibold tracking-wider">Достигнутые уровни Блума:</p>
                <div className="flex flex-wrap gap-2">
                  {achievedLevels.length > 0 ? (
                    achievedLevels.map((lvl: string) => (
                      <span key={lvl} className="bg-[#E6F7EE] text-[#007A40] px-2 py-1 rounded-[8px] text-xs border border-[#00A859]/30 font-medium">
                        {lvl}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#8C8C8C] text-xs">Уровни не достигнуты</span>
                  )}
                </div>
              </div>

              <div className="flex items-center text-[#007A40] bg-[#E6F7EE] p-3 rounded-[8px] border border-[#00A859]/30">
                <CheckCircle className="w-5 h-5 mr-2" strokeWidth={1.75} />
                <span className="font-semibold">Сессия завершена. Прогресс сохранен.</span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-[#9B1D27]/10 border border-[#9B1D27]/30 text-[#9B1D27] rounded-[8px] text-sm">
            {error}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[#D9D9D9] bg-[#F5F5F5]">
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
              placeholder="Напишите ответ (Enter — отправить)..."
              className="w-full bg-white border border-[#D9D9D9] rounded-[8px] py-3 px-4 pr-12 text-sm text-[#1A1A1A] placeholder-[#8C8C8C] focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859] resize-none h-20"
            />
            <button
              type="submit"
              disabled={isVerifying || !input.trim()}
              className="absolute bottom-3 right-3 p-2 bg-[#00A859] hover:bg-[#007A40] disabled:bg-[#D9D9D9] disabled:text-[#8C8C8C] text-white rounded-[8px] transition-colors"
            >
              {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} /> : <Send className="w-4 h-4" strokeWidth={1.75} />}
            </button>
          </form>
        ) : (
          <button
            onClick={() => window.location.href = `/student/${studentName}`}
            className="w-full py-3 bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] rounded-[8px] text-sm font-semibold transition-colors border border-[#D9D9D9]"
          >
            Вернуться к списку юнитов
          </button>
        )}
      </div>
    </div>
  )
}
