'use client'

import { useState } from 'react'
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, BookOpen, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

type ResultChunk = {
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
  const [result, setResult] = useState<ResultChunk | null>(null)
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

      setResult(data)
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
    <div className="min-h-screen bg-zinc-950 text-zinc-50 p-8">
      <header className="mb-10 max-w-3xl mx-auto">
        <Link href="/curator" className="text-sm text-blue-400 hover:text-blue-300 mb-4 inline-flex items-center">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Назад к дашборду
        </Link>
        <div className="flex items-center mt-2">
          <div className="p-3 bg-blue-500/10 rounded-xl mr-4">
            <Sparkles className="w-7 h-7 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI-Обработка транскрипта</h1>
            <p className="text-zinc-400 mt-1">Gemini разобьёт материал на юниты и добавит их в учебный план</p>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto space-y-6">

        {/* How it works */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase mb-4">Как это работает</h2>
          <div className="grid grid-cols-3 gap-4">
            {[
              { step: '1', label: 'Загружаете транскрипт', desc: '.txt или .md файл с текстом лекции/практики' },
              { step: '2', label: 'Gemini обрабатывает', desc: 'Структурирует материал, генерирует вопросы по Блуму' },
              { step: '3', label: 'Появляется в системе', desc: 'Юнит добавляется в GitHub и учебный план студентов' },
            ].map(({ step, label, desc }) => (
              <div key={step} className="text-center">
                <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center mx-auto mb-2 text-sm">
                  {step}
                </div>
                <p className="font-medium text-sm text-zinc-200">{label}</p>
                <p className="text-xs text-zinc-500 mt-1">{desc}</p>
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
              className="border-2 border-dashed border-zinc-700 hover:border-blue-500/50 bg-zinc-900/50 rounded-2xl p-12 text-center transition-colors"
            >
              {file ? (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-blue-500/10 rounded-full mb-4">
                    <FileText className="w-10 h-10 text-blue-400" />
                  </div>
                  <p className="font-medium text-lg text-zinc-200">{file.name}</p>
                  <p className="text-sm text-zinc-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  <button
                    onClick={() => setFile(null)}
                    className="mt-4 text-sm text-red-400 hover:text-red-300"
                  >
                    Удалить
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="p-4 bg-zinc-800 rounded-full mb-4">
                    <UploadCloud className="w-10 h-10 text-zinc-400" />
                  </div>
                  <p className="text-lg font-medium text-zinc-300 mb-2">Перетащите файл сюда</p>
                  <p className="text-sm text-zinc-500 mb-6">или нажмите для выбора файла (.txt, .md)</p>
                  <input
                    type="file"
                    accept=".txt,.md"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => e.target.files && setFile(e.target.files[0])}
                  />
                  <label
                    htmlFor="file-upload"
                    className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors cursor-pointer"
                  >
                    Выбрать файл
                  </label>
                </div>
              )}
            </div>

            {/* Optional chunk ID hint */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                ID юнита (необязательно)
              </label>
              <input
                type="text"
                value={chunkIdHint}
                onChange={(e) => setChunkIdHint(e.target.value)}
                placeholder="например: s3-w2-lecture"
                className="w-full bg-zinc-950 border border-zinc-700 rounded-xl py-2.5 px-4 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-blue-500/50"
              />
              <p className="text-xs text-zinc-600 mt-2">Если оставить пустым — Gemini сгенерирует ID автоматически</p>
            </div>

            {/* Process button */}
            <div className="flex justify-end">
              <button
                onClick={handleUpload}
                disabled={!file || stage === 'processing' || stage === 'uploading'}
                className={`px-8 py-3 rounded-xl font-medium transition-all flex items-center shadow-lg ${
                  !file || stage !== 'idle'
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'
                }`}
              >
                {stage === 'uploading' || stage === 'processing' ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    {stage === 'uploading' ? 'Загрузка...' : 'Gemini обрабатывает...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Обработать с помощью AI
                  </>
                )}
              </button>
            </div>

            {/* Processing indicator */}
            {stage === 'processing' && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
                <div className="flex items-center">
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin mr-3" />
                  <div>
                    <p className="font-medium text-blue-300">Gemini анализирует транскрипт...</p>
                    <p className="text-sm text-zinc-500 mt-1">Это может занять 20–40 секунд. Не закрывайте страницу.</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  {['Читаем транскрипт', 'Структурируем учебный материал', 'Генерируем вопросы по Блуму', 'Коммитим в GitHub'].map((step, i) => (
                    <div key={i} className="flex items-center text-sm text-zinc-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500/50 mr-2 animate-pulse" />
                      {step}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error */}
            {stage === 'error' && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start text-red-400">
                <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Ошибка при обработке</p>
                  <p className="text-sm mt-1 text-red-400/80">{errorMsg}</p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Success */}
        {stage === 'done' && result && (
          <div className="space-y-4">
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-emerald-400 mr-3" />
                <h2 className="font-semibold text-emerald-300 text-lg">Юнит успешно создан!</h2>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-950/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-1">ID юнита</p>
                  <p className="font-mono font-medium text-zinc-200">{result.chunkId}</p>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-4">
                  <p className="text-xs text-zinc-500 mb-1">Тип</p>
                  <p className="font-medium text-zinc-200">{typeLabels[result.type] || result.type}</p>
                </div>
                <div className="bg-zinc-950/50 rounded-xl p-4 col-span-2">
                  <p className="text-xs text-zinc-500 mb-1">Название</p>
                  <p className="font-medium text-zinc-200">{result.title}</p>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  <span>Создан файл <code className="text-zinc-300">course/{result.chunkId}/content.md</code></span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  <span>Создан файл <code className="text-zinc-300">course/{result.chunkId}/meta.md</code> с вопросами по Блуму</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-emerald-500 mr-2" />
                  <span>Обновлён <code className="text-zinc-300">course/sequence.md</code></span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                <UploadCloud className="w-4 h-4 mr-2" />
                Загрузить ещё один
              </button>
              <Link
                href="/curator"
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium transition-colors flex items-center justify-center"
              >
                <BookOpen className="w-4 h-4 mr-2" />
                Смотреть в дашборде
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
