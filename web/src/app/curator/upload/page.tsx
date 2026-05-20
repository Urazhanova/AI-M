'use client'

import { useState } from 'react'
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type CreatedUnit = {
  chunkId: string
  title: string
  type: string
  date: string
}

type Stage = 'idle' | 'uploading' | 'processing' | 'done' | 'error'

export default function UploadTranscript() {
  const [file, setFile] = useState<File | null>(null)
  const [chunkIdHint, setChunkIdHint] = useState('')
  const [stage, setStage] = useState<Stage>('idle')
  const [result, setResult] = useState<CreatedUnit[] | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setStage('uploading')
    setErrorMsg('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('chunkId', chunkIdHint)

      setStage('processing')

      const res = await fetch('/api/process-transcript', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Неизвестная ошибка при обработке')
        setStage('error')
        return
      }

      setResult(Array.isArray(data.units) ? data.units : [])
      setStage('done')
      setFile(null)
      setChunkIdHint('')
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка сети')
      setStage('error')
    }
  }

  const resetForm = () => {
    setStage('idle')
    setResult(null)
    setFile(null)
    setChunkIdHint('')
    setErrorMsg('')
  }

  const typeLabels: Record<string, string> = {
    lecture: 'Лекция',
    practical: 'Практика',
    workshop: 'Воркшоп',
    intro: 'Введение',
  }

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] p-8">
      <header className="mb-10 max-w-3xl mx-auto">
        <Link href="/curator" className="text-sm text-[#8C8C8C] hover:text-[#00A859] mb-4 inline-flex items-center transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" strokeWidth={1.75} />
          Назад к дашборду
        </Link>
        <div className="flex items-center mt-2">
          <div className="w-14 h-14 bg-[#E6F7EE] rounded-full flex items-center justify-center mr-4">
            <Sparkles className="w-7 h-7 text-[#00A859]" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1A1A1A]">AI-Обработка транскрипта</h1>
            <p className="text-[#4A4A4A] mt-1">Gemini разобьёт материал на юниты и добавит их в учебный план</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* How it works */}
        <div className="bg-white border border-[#D9D9D9] rounded-[14px] p-6 bcc-shadow">
          <h2 className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider mb-4">Как это работает</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Загружаете транскрипт', desc: '.txt или .md файл с текстом лекции/практики' },
              { step: '2', label: 'Gemini обрабатывает', desc: 'Структурирует материал, генерирует вопросы по Блуму' },
              { step: '3', label: 'Появляется в системе', desc: 'Юнит добавляется в GitHub и учебный план студентов' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="text-center">
                <div className="w-9 h-9 rounded-full bg-[#E6F7EE] text-[#00A859] font-bold flex items-center justify-center mx-auto mb-2 text-sm">
                  {step}
                </div>
                <p className="font-semibold text-sm text-[#1A1A1A]">{label}</p>
                <p className="text-xs text-[#8C8C8C] mt-1">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Upload form */}
        {stage !== 'done' && (
          <>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#D9D9D9] hover:border-[#00A859] bg-white rounded-[14px] p-12 text-center transition-colors bcc-shadow"
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#E6F7EE] rounded-full flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-[#00A859]" strokeWidth={1.5} />
                  </div>
                  <p className="font-semibold text-lg text-[#1A1A1A]">{file.name}</p>
                  <p className="text-sm text-[#8C8C8C] mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="mt-4 text-sm text-[#9B1D27] hover:underline font-medium"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
                    <UploadCloud className="w-8 h-8 text-[#8C8C8C]" strokeWidth={1.5} />
                  </div>
                  <p className="text-lg font-semibold text-[#1A1A1A] mb-2">Перетащите файл сюда</p>
                  <p className="text-sm text-[#8C8C8C] mb-6">или нажмите для выбора файла (.txt, .md)</p>
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-6 py-2.5 bg-[#F5F5F5] hover:bg-[#E6F7EE] text-[#1A1A1A] rounded-[8px] font-semibold transition-colors cursor-pointer border border-[#D9D9D9]"
                  >
                    Выбрать файл
                  </label>
                </div>
              )}
            </div>

            {/* Optional chunk ID hint */}
            <div className="bg-white border border-[#D9D9D9] rounded-[14px] p-5 bcc-shadow">
              <label className="block text-sm font-semibold text-[#1A1A1A] mb-2">
                ID юнита (необязательно)
              </label>
              <input
                type="text"
                value={chunkIdHint}
                onChange={(e) => setChunkIdHint(e.target.value)}
                placeholder="например: s3-w2-lecture"
                className="w-full bg-[#F5F5F5] border border-[#D9D9D9] rounded-[8px] py-2.5 px-4 text-sm text-[#1A1A1A] placeholder-[#8C8C8C] focus:outline-none focus:border-[#00A859] focus:ring-1 focus:ring-[#00A859]"
              />
              <p className="text-xs text-[#8C8C8C] mt-2">Если оставить пустым — Gemini сгенерирует ID автоматически</p>
            </div>

            {/* Process button */}
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || stage === 'processing' || stage === 'uploading'}
                className={`px-8 py-3 rounded-[8px] font-semibold transition-all flex items-center ${
                  !file || stage !== 'idle'
                    ? 'bg-[#D9D9D9] text-[#8C8C8C] cursor-not-allowed'
                    : 'bg-[#00A859] hover:bg-[#007A40] text-white bcc-shadow'
                }`}
              >
                {stage === 'uploading' || stage === 'processing' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" strokeWidth={2} />
                    {stage === 'uploading' ? 'Загрузка...' : 'Gemini обрабатывает...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" strokeWidth={1.75} />
                    Обработать с помощью AI
                  </>
                )}
              </button>
            </div>

            {/* Processing indicator */}
            {stage === 'processing' && (
              <div className="bg-[#E6F7EE] border border-[#00A859]/30 rounded-[14px] p-6">
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 text-[#00A859] animate-spin mr-3" strokeWidth={2} />
                  <div>
                    <p className="font-semibold text-[#007A40]">Gemini анализирует транскрипт...</p>
                    <p className="text-sm text-[#4A4A4A] mt-1">Это может занять 20–40 секунд. Не закрывайте страницу.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {['Читаем транскрипт', 'Структурируем учебный материал', 'Генерируем вопросы по Блуму', 'Коммитим в GitHub'].map((step, i) => (
                    <div key={i} className="flex items-center text-sm text-[#4A4A4A]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00A859] mr-2 animate-pulse" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {stage === 'error' && (
              <div className="p-4 bg-[#9B1D27]/10 border border-[#9B1D27]/30 rounded-[8px] flex items-start text-[#9B1D27]">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" strokeWidth={1.75} />
                <div>
                  <p className="font-semibold">Ошибка при обработке</p>
                  <p className="text-sm mt-1 text-[#9B1D27]/80">{errorMsg}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Success */}
        {stage === 'done' && result && result.length > 0 && (
          <div className="space-y-4">
            <div className="bg-[#E6F7EE] border border-[#00A859]/30 rounded-[14px] p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-[#00A859] mr-3" strokeWidth={1.75} />
                <h2 className="font-bold text-[#007A40] text-lg">
                  {result.length === 1 ? 'Юнит создан!' : `Создано юнитов: ${result.length}`}
                </h2>
              </div>

              <div className="space-y-3">
                {result.map((unit) => (
                  <div key={unit.chunkId} className="bg-white rounded-[8px] p-4 border border-[#D9D9D9]">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-[#1A1A1A]">{unit.title}</p>
                        <p className="font-mono text-xs text-[#8C8C8C] mt-1">{unit.chunkId}</p>
                      </div>
                      <span className="text-xs px-2 py-1 rounded bg-[#E6F7EE] text-[#007A40] whitespace-nowrap font-semibold border border-[#00A859]/20">
                        {typeLabels[unit.type] || unit.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-5 space-y-2 text-sm text-[#4A4A4A]">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-[#00A859] mr-2" strokeWidth={1.75} />
                  <span>Созданы <code className="text-[#1A1A1A] bg-white px-1 rounded">content.md</code> и <code className="text-[#1A1A1A] bg-white px-1 rounded">meta.md</code> для каждого юнита</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-[#00A859] mr-2" strokeWidth={1.75} />
                  <span>Обновлён <code className="text-[#1A1A1A] bg-white px-1 rounded">course/sequence.md</code></span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-[#00A859] mr-2" strokeWidth={1.75} />
                  <span>Юниты добавлены в <code className="text-[#1A1A1A] bg-white px-1 rounded">my-path.md</code> всех студентов</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3 bg-white hover:bg-[#F5F5F5] text-[#1A1A1A] rounded-[8px] font-semibold transition-colors flex items-center justify-center border border-[#D9D9D9]"
              >
                <UploadCloud className="w-4 h-4 mr-2" strokeWidth={1.75} />
                Загрузить ещё один
              </button>
              <Link
                href="/curator"
                className="flex-1 py-3 bg-[#00A859] hover:bg-[#007A40] text-white rounded-[8px] font-semibold transition-colors flex items-center justify-center bcc-shadow"
              >
                <BookOpen className="w-4 h-4 mr-2" strokeWidth={1.75} />
                Смотреть в дашборде
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
