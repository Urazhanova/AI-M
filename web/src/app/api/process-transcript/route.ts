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

function parseChunkId(chunkId: string): { sprint: string; week: string } {
  const m = chunkId.match(/^s(\d+)(?:-w(\d+))?/i)
  if (!m) return { sprint: 's?', week: '?' }
  const sprint = `s${m[1]}`
  const week = m[2] ? `w${m[2]}` : (chunkId.includes('-intro') ? 'intro' : 'w?')
  return { sprint, week }
}

function appendUnitsToMyPath(
  content: string,
  newUnits: Array<{ chunkId: string; type: string }>
): { updated: string; changed: boolean } {
  const lines = content.split('\n')
  const sectionIdx = lines.findIndex(l => /^##\s+Текущий\s+статус/i.test(l))
  if (sectionIdx === -1) return { updated: content, changed: false }

  let tableStart = -1
  for (let i = sectionIdx + 1; i < lines.length; i++) {
    const l = lines[i]
    if (l.startsWith('|')) { tableStart = i; break }
    if (l.startsWith('##')) return { updated: content, changed: false }
  }
  if (tableStart === -1) return { updated: content, changed: false }

  let tableEnd = tableStart
  while (tableEnd + 1 < lines.length && lines[tableEnd + 1].startsWith('|')) tableEnd++

  const tableText = lines.slice(tableStart, tableEnd + 1).join('\n')
  const rowsToAdd: string[] = []
  for (const u of newUnits) {
    if (tableText.includes(`| ${u.chunkId} |`)) continue
    rowsToAdd.push(`| ${u.chunkId} | ${u.type} | ⬜ не начат | — | — |`)
  }
  if (rowsToAdd.length === 0) return { updated: content, changed: false }

  const updatedLines = [
    ...lines.slice(0, tableEnd + 1),
    ...rowsToAdd,
    ...lines.slice(tableEnd + 1),
  ]
  return { updated: updatedLines.join('\n'), changed: true }
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
    // gemini-2.5-flash handles 1M-token contexts; ~60K chars ≈ 15K tokens is safe
    const truncated = transcriptText.substring(0, 60000)

    const genAI = new GoogleGenerativeAI(apiKey)

    // ── Step 1: Split transcript into self-contained units ──────────────────
    const splitModel = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    })

    const splitPrompt = `Ты методист курса "AI-native организации".
Раздели транскрипт на самостоятельные учебные юниты. Юнит — смысловая единица, которую можно изучить отдельно (одна крупная идея/тема/практика). Лекция 1.5–2 часа обычно даёт 2–5 юнитов. Не дроби слишком мелко: один юнит = 20–40 минут материала минимум.

ТРАНСКРИПТ:
"""
${truncated}
"""

${chunkIdHint ? `Подсказка по базовому ID от куратора: "${chunkIdHint}". Используй как основу. Если юнитов несколько — добавляй суффиксы -a, -b, -c.` : ''}

Верни JSON строго в формате:
{
  "units": [
    {
      "chunkId": "s3-w2-lecture-a",
      "title": "Явное название юнита на русском",
      "type": "lecture",
      "date": "2026-05-09",
      "prerequisites": ["s3-w1-lecture"],
      "speaker": "Имя или пустая строка",
      "scope_summary": "2-3 предложения о содержании юнита — будет использовано для извлечения контента из транскрипта"
    }
  ]
}

Правила:
- chunkId: только строчные латинские, цифры, дефисы. Формат s{N}-w{N}-{type}[-suffix]
- type: lecture | practical | workshop | intro
- prerequisites: ID предыдущих юнитов или [] (для всех юнитов одной лекции — общий список пререквизитов)
- Минимум 1, максимум 6 юнитов
- scope_summary критично — на нём строится извлечение контента
- Не добавляй текст вне JSON`

    const splitResult = await splitModel.generateContent(splitPrompt)
    const splitRaw = splitResult.response.text().trim()

    let unitSpecs: Array<{
      chunkId: string
      title: string
      type: string
      date: string
      prerequisites: string[]
      speaker: string
      scope_summary: string
    }> = []
    try {
      const parsed = JSON.parse(cleanJson(splitRaw))
      unitSpecs = Array.isArray(parsed.units) ? parsed.units : []
    } catch {
      return NextResponse.json(
        { error: `Не удалось распарсить разбивку от Gemini: ${splitRaw.substring(0, 300)}` },
        { status: 500 }
      )
    }

    if (unitSpecs.length === 0) {
      return NextResponse.json({ error: 'Gemini не вернул ни одного юнита' }, { status: 500 })
    }

    // ── Step 2: For each unit — generate content.md + meta.md, commit ───────
    const contentModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })
    const created: Array<{
      chunkId: string
      title: string
      type: string
      date: string
      prerequisites: string[]
    }> = []

    for (const spec of unitSpecs) {
      const { chunkId, title, type, date, prerequisites, speaker, scope_summary } = spec
      if (!chunkId || !title) continue

      const safeDate = date || new Date().toISOString().split('T')[0]
      const safeType = type || 'lecture'
      const safePrereqs = Array.isArray(prerequisites) ? prerequisites : []

      const contentPrompt = `Ты методист курса "AI-native организации".
Извлеки из транскрипта ТОЛЬКО ту часть, которая относится к юниту, и оформи как учебный материал на русском в Markdown.

ТРАНСКРИПТ ПОЛНОСТЬЮ:
"""
${truncated}
"""

Юнит: "${title}" (${chunkId})
Содержание этого юнита (что брать): ${scope_summary}

Правила:
- Заголовок H1: "# ${title}"
- Метаблок: **Дата:** ${safeDate}, **Формат:** ${safeType}, **Спикер:** ${speaker || 'не указан'}
- Раздели на H2/H3
- Бери ТОЛЬКО фрагменты транскрипта, относящиеся к scope этого юнита. Не пересказывай весь транскрипт.
- Убери повторы, слова-паразиты, артефакты
- Сохрани ключевые идеи, примеры, выводы из своего scope
- Минимум 400 слов
- Только Markdown, без JSON`

      const contentResult = await contentModel.generateContent(contentPrompt)
      const contentMd = contentResult.response.text().trim()

      const { sprint, week } = parseChunkId(chunkId)
      const prereqYaml = safePrereqs.join(', ')

      const metaPrompt = `Ты методист курса "AI-native организации".
Создай файл метаданных для юнита "${title}" (${chunkId}) СТРОГО по шаблону ниже. Это обязательная схема: yaml-заголовок, Learning Outcomes (KSA), Проверка усвоения, Definition of Done, Граф связей.

Краткое содержание юнита (первые 3000 символов content.md):
"""
${contentMd.substring(0, 3000)}
"""

Параметры (используй ровно эти значения):
- chunkId: ${chunkId}
- title: ${title}
- session_type: ${safeType}
- date: ${safeDate}
- sprint: ${sprint}
- week: ${week}
- speaker: ${speaker || 'не указан'}
- prerequisites: [${prereqYaml}]

Таксономия Блума:
1 — Помнит, 2 — Понимает, 3 — Применяет, 4 — Анализирует, 5 — Оценивает, 6 — Создаёт.

Верни Markdown ровно по этому шаблону. Не добавляй ничего вне шаблона.

# meta: ${chunkId}

\`\`\`yaml
id: ${chunkId}
title: "${title}"
session_type: ${safeType}
date: ${safeDate}
duration_min: <оцени по объёму контента, целое число>
sprint: ${sprint}
week: ${week}
position: 0
speaker: "${speaker || ''}"
\`\`\`

## Learning Outcomes (с таксономией Блума)

### Knowledge — что студент должен помнить и понимать
| Знание | Уровень Блума |
|---|---|
| <фактическое знание из юнита> | 1 |
| <концепция/определение> | 2 |
| <принцип/закономерность> | 2 |
(минимум 3 строки)

### Skills — что студент должен уметь делать
| Навык | Уровень Блума |
|---|---|
| <конкретное умение, проверяемое действием> | 3 |
| <умение анализа/декомпозиции> | 4 |
| <умение оценки/критики> | 5 |
(минимум 3 строки, уровни 3-6)

### Attitudes — какие установки и mindset-сдвиги формирует юнит
| Установка / mindset-сдвиг | Уровень Блума |
|---|---|
| <ценностная установка> | 4 |
| <принцип поведения/решения> | 5 |
(минимум 2 строки)

## Проверка усвоения

### Знание (Knowledge)
- <вопрос на воспроизведение факта>
- <вопрос на воспроизведение факта>

### Понимание (Comprehension)
- <объяснить своими словами>
- <привести пример>

### Применение (Application)
- <практический сценарий>
- <практический сценарий>

### Анализ (Analysis)
- <разложить на части / сравнить>
- <разложить на части / сравнить>

### Синтез (Synthesis)
- <предложить решение / собрать новое>
- <предложить решение / собрать новое>

### Оценка (Evaluation)
- <оценить с обоснованием>
- <оценить с обоснованием>

## Definition of Done

### Минимальный DoD (Bloom 1-3)
- <конкретный артефакт или действие, проверяемое объективно>
- <конкретный артефакт или действие, проверяемое объективно>

### Полный DoD (Bloom 4-6)
- <артефакт уровня анализа/синтеза/оценки>
- <артефакт уровня анализа/синтеза/оценки>

## Граф связей

\`\`\`yaml
prerequisites: [${prereqYaml}]
leads_to: []
related: []
\`\`\`
`

      const metaResult = await contentModel.generateContent(metaPrompt)
      const metaMd = metaResult.response.text().trim()

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

      created.push({ chunkId, title, type: safeType, date: safeDate, prerequisites: safePrereqs })
    }

    if (created.length === 0) {
      return NextResponse.json({ error: 'Не создано ни одного юнита' }, { status: 500 })
    }

    // ── Step 3: Append all new units to sequence.md ─────────────────────────
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
    if (seqRes.ok) {
      const seqData = await seqRes.json()
      if (seqData.type === 'file') {
        currentSeq = Buffer.from(seqData.content, 'base64').toString('utf-8')
      }
    }

    let seqChanged = false
    let updatedSeq = currentSeq.trimEnd()
    for (const unit of created) {
      if (currentSeq.includes(`id: ${unit.chunkId}`)) continue
      const prereqList = unit.prerequisites.join(', ')
      updatedSeq += `

### ${unit.chunkId}
\`\`\`yaml
id: ${unit.chunkId}
title: "${unit.title}"
date: ${unit.date}
type: ${unit.type}
prerequisites: [${prereqList}]
leads_to: []
related: []
\`\`\`
`
      seqChanged = true
    }
    if (seqChanged) {
      const ids = created.map(u => u.chunkId).join(', ')
      await commitFile('course/sequence.md', updatedSeq, `[AI] Добавлены юниты в sequence.md: ${ids}`)
    }

    // ── Step 4: Append new units to each student's my-path.md ──────────────
    const studentsTouched: string[] = []
    let students: string[] = []
    try {
      const dirRes = await octokit.rest.repos.getContent({ owner, repo, path: 'students' })
      if (Array.isArray(dirRes.data)) {
        students = dirRes.data.filter(e => e.type === 'dir').map(e => e.name)
      }
    } catch {
      // students/ not found — silently skip
    }

    for (const student of students) {
      const path = `students/${student}/my-path.md`
      let myPath = ''
      try {
        const fileRes = await octokit.rest.repos.getContent({ owner, repo, path })
        if (!Array.isArray(fileRes.data) && fileRes.data.type === 'file') {
          myPath = Buffer.from(fileRes.data.content, 'base64').toString('utf-8')
        }
      } catch {
        continue
      }
      if (!myPath) continue

      const { updated, changed } = appendUnitsToMyPath(
        myPath,
        created.map(u => ({ chunkId: u.chunkId, type: u.type }))
      )
      if (changed) {
        await commitFile(path, updated, `[AI] my-path.md ${student}: добавлены новые юниты`)
        studentsTouched.push(student)
      }
    }

    return NextResponse.json({ success: true, units: created, studentsTouched })

  } catch (err: any) {
    console.error('process-transcript error:', err)
    return NextResponse.json({ error: err?.message || 'Неизвестная ошибка' }, { status: 500 })
  }
}
