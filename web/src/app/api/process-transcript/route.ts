import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { octokit } from '@/lib/github'

const owner = process.env.GITHUB_OWNER || 'Urazhanova'
const repo = process.env.GITHUB_REPO || 'AI-M'

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function commitFile(path: string, content: string, message: string) {
  let sha: string | undefined
  try {
    const res = await octokit.rest.repos.getContent({ owner, repo, path })
    if (!Array.isArray(res.data) && res.data.type === 'file') {
      sha = res.data.sha
    }
  } catch {
    // File doesn't exist yet
  }

  await octokit.rest.repos.createOrUpdateFileContents({
    owner,
    repo,
    path,
    message,
    content: Buffer.from(content).toString('base64'),
    sha,
    branch: 'main',
  })
}

function cleanJson(raw: string): string {
  return raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY не настроен' }, { status: 500 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const chunkIdHint = (formData.get('chunkId') as string) || ''

    if (!file) {
      return NextResponse.json({ error: 'Файл не передан' }, { status: 400 })
    }

    const transcriptText = await file.text()
    // Limit to 12000 chars to avoid token overload
    const truncated = transcriptText.substring(0, 12000)

    const genAI = new GoogleGenerativeAI(apiKey)

    // ── Step 1: Extract metadata only (small JSON) ────────────────────────────
    const metaModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const metaPrompt = `Ты методист курса "AI-native организации".
Проанализируй транскрипт и верни ТОЛЬКО JSON с метаданными:

ТРАНСКРИПТ (начало):
"""
${truncated.substring(0, 3000)}
"""

${chunkIdHint ? `Подсказка по ID от куратора: "${chunkIdHint}"` : ''}

Верни JSON строго в таком формате:
{
  "chunkId": "s3-w2-lecture",
  "title": "Название юнита на русском",
  "type": "lecture",
  "date": "2026-05-09",
  "prerequisites": ["s3-w1-lecture"],
  "speaker": "Имя спикера или пустая строка"
}

Правила:
- chunkId: только строчные латинские, цифры, дефисы. Формат s3-w[N]-[type]
- type: одно из: lecture, practical, workshop, intro
- prerequisites: список ID предыдущих юнитов, или пустой массив
- Не добавляй ничего кроме JSON`

    const metaResult = await metaModel.generateContent(metaPrompt)
    const metaRaw = metaResult.response.text().trim()

    let meta: any
    try {
      meta = JSON.parse(cleanJson(metaRaw))
    } catch {
      return NextResponse.json(
        { error: `Не удалось распарсить метаданные от Gemini: ${metaRaw.substring(0, 300)}` },
        { status: 500 }
      )
    }

    const { chunkId, title, type, date, prerequisites, speaker } = meta

    if (!chunkId || !title) {
      return NextResponse.json({ error: 'Gemini не вернул chunkId или title' }, { status: 500 })
    }

    // ── Step 2: Generate content.md ───────────────────────────────────────────
    const contentModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    const contentPrompt = `Ты методист курса "AI-native организации".
Преврати транскрипт в чистый структурированный учебный материал на русском языке в формате Markdown.

Юнит: "${title}" (${chunkId})

ТРАНСКРИПТ:
"""
${truncated}
"""

Правила:
- Начни с заголовка H1: "# ${title}"
- Добавь блок метаданных: Дата, Формат, Спикер: ${speaker || 'не указан'}
- Раздели на логические части с заголовками H2 и H3
- Убери повторы, слова-паразиты, технические артефакты транскрипта
- Сохрани все ключевые идеи, примеры, выводы
- Минимум 600 слов
- Только Markdown, никакого JSON`

    const contentResult = await contentModel.generateContent(contentPrompt)
    const contentMd = contentResult.response.text().trim()

    // ── Step 3: Generate meta.md (Bloom questions) ────────────────────────────
    const bloomPrompt = `Ты методист курса "AI-native организации".
Создай файл метаданных для юнита "${title}" (${chunkId}).

Краткое содержание юнита (первые 2000 символов контента):
"""
${contentMd.substring(0, 2000)}
"""

Создай Markdown-файл строго в таком формате:

# Мета-данные юнита ${chunkId}

**Дата:** ${date || new Date().toISOString().split('T')[0]}
**Формат:** Лекция (~2 часа)
**Спикер:** ${speaker || 'не указан'}

---

## Вопросы для проверки по таксономии Блума

### Знание (Knowledge)
- Вопрос 1
- Вопрос 2

### Понимание (Comprehension)
- Вопрос

### Применение (Application)
- Вопрос (практический сценарий)

### Анализ (Analysis)
- Вопрос

### Синтез (Synthesis)
- Вопрос

### Оценка (Evaluation)
- Вопрос

Только Markdown, минимум 2 вопроса на каждый уровень Блума, все на русском.`

    const bloomResult = await contentModel.generateContent(bloomPrompt)
    const metaMd = bloomResult.response.text().trim()

    // ── Step 4: Commit to GitHub ───────────────────────────────────────────────
    await commitFile(
      `course/${chunkId}/content.md`,
      contentMd,
      `[AI] Добавлен юнит ${chunkId}: ${title}`
    )

    await commitFile(
      `course/${chunkId}/meta.md`,
      metaMd,
      `[AI] Метаданные юнита ${chunkId}`
    )

    // ── Step 5: Update sequence.md ────────────────────────────────────────────
    const token = process.env.GITHUB_TOKEN
    const seqRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/course/sequence.md`,
      {
        headers: {
          Accept: 'application/vnd.github+json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        cache: 'no-store',
      }
    )

    let currentSeq = ''
    let seqSha: string | undefined

    if (seqRes.ok) {
      const seqData = await seqRes.json()
      if (seqData.type === 'file') {
        currentSeq = Buffer.from(seqData.content, 'base64').toString('utf-8')
        seqSha = seqData.sha
      }
    }

    if (!currentSeq.includes(`id: ${chunkId}`)) {
      const prereqList = (prerequisites || []).join(', ')
      const newBlock = `
### ${chunkId}
\`\`\`yaml
id: ${chunkId}
title: "${title}"
date: ${date || new Date().toISOString().split('T')[0]}
type: ${type || 'lecture'}
prerequisites: [${prereqList}]
leads_to: []
related: []
\`\`\`
`
      const updatedSeq = currentSeq.trimEnd() + '\n' + newBlock
      await commitFile('course/sequence.md', updatedSeq, `[AI] Добавлен ${chunkId} в sequence.md`)
    }

    return NextResponse.json({ success: true, chunkId, title, type, date })

  } catch (err: any) {
    console.error('process-transcript error:', err)
    return NextResponse.json({ error: err?.message || 'Неизвестная ошибка' }, { status: 500 })
  }
}
