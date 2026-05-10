// Одноразовая миграция meta.md старого формата ("Вопросы по Блуму") в новую схему
// CLAUDE.md (yaml-заголовок + Learning Outcomes KSA + Проверка усвоения + DoD + Граф связей).
// Также добавляет недостающие чанки в my-path.md всех студентов.
//
// Запуск: cd web && node scripts/migrate-meta-to-new-schema.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

// Загрузить .env.local из web/
const envPath = path.resolve(__dirname, '../.env.local')
const envText = fs.readFileSync(envPath, 'utf-8')
for (const line of envText.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && m[2]) process.env[m[1]] = m[2].trim()
}

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  console.error('GEMINI_API_KEY не найден в .env.local')
  process.exit(1)
}

const genAI = new GoogleGenerativeAI(apiKey)
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

function parseChunkId(chunkId) {
  const m = chunkId.match(/^s(\d+)(?:-w(\d+))?/i)
  if (!m) return { sprint: 's?', week: '?' }
  const sprint = `s${m[1]}`
  const week = m[2] ? `w${m[2]}` : (chunkId.includes('-intro') ? 'intro' : 'w?')
  return { sprint, week }
}

function buildMetaPrompt({ chunkId, title, type, date, sprint, week, speaker, prerequisites, contentMd }) {
  const prereqYaml = prerequisites.join(', ')
  return `Ты методист курса "AI-native организации".
Создай файл метаданных для юнита "${title}" (${chunkId}) СТРОГО по шаблону ниже. Это обязательная схема: yaml-заголовок, Learning Outcomes (KSA), Проверка усвоения, Definition of Done, Граф связей.

Краткое содержание юнита (первые 3000 символов content.md):
"""
${contentMd.substring(0, 3000)}
"""

Параметры (используй ровно эти значения):
- chunkId: ${chunkId}
- title: ${title}
- session_type: ${type}
- date: ${date}
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
session_type: ${type}
date: ${date}
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
}

// Чанки для миграции и их пререквизиты (граф из sequence.md)
const TARGETS = [
  { chunkId: 's3-w1-lecture', type: 'lecture', prerequisites: ['s3-intro'] },
  { chunkId: 's3-w1-workshop', type: 'workshop', prerequisites: ['s3-w1-lecture'] },
  { chunkId: 's3-w2-lecture', type: 'lecture', prerequisites: ['s3-w1-lecture'] },
]

console.log('=== Миграция meta.md в новую схему ===\n')

for (const target of TARGETS) {
  const { chunkId, type, prerequisites } = target
  const contentPath = path.join(repoRoot, 'course', chunkId, 'content.md')
  const metaPath = path.join(repoRoot, 'course', chunkId, 'meta.md')

  const contentMd = fs.readFileSync(contentPath, 'utf-8')
  const oldMeta = fs.readFileSync(metaPath, 'utf-8')

  // title — из H1 в content.md
  const titleMatch = contentMd.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1].trim() : chunkId

  // date — из старого meta или сегодня
  const dateMatch = oldMeta.match(/\*\*Дата:\*\*\s*(\d{4}-\d{2}-\d{2})/)
  const date = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

  // speaker — из старого meta
  const speakerMatch = oldMeta.match(/\*\*Спикер:\*\*\s*([^\n]+)/)
  const speaker = speakerMatch ? speakerMatch[1].trim().replace(/^не указан$/i, '') : ''

  const { sprint, week } = parseChunkId(chunkId)

  console.log(`→ ${chunkId} (${title.substring(0, 50)}...)`)
  console.log(`  date: ${date}, speaker: ${speaker || '—'}, prereqs: [${prerequisites.join(', ')}]`)

  const prompt = buildMetaPrompt({
    chunkId, title, type, date, sprint, week, speaker, prerequisites, contentMd,
  })

  const result = await model.generateContent(prompt)
  const newMeta = result.response.text().trim()

  fs.writeFileSync(metaPath, newMeta + '\n')
  console.log(`  ✓ записано: course/${chunkId}/meta.md (${newMeta.length} chars)\n`)
}

// Добавить недостающие юниты в my-path.md студентов
const NEW_UNITS_FOR_PATH = [
  { chunkId: 's3-w2-lecture', type: 'lecture' },
]

function appendUnitsToMyPath(content, newUnits) {
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
  const rowsToAdd = []
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

console.log('=== Обновление my-path.md студентов ===\n')

const studentsDir = path.join(repoRoot, 'students')
const students = fs.readdirSync(studentsDir).filter(s =>
  fs.statSync(path.join(studentsDir, s)).isDirectory()
)

for (const student of students) {
  const myPathFile = path.join(studentsDir, student, 'my-path.md')
  if (!fs.existsSync(myPathFile)) {
    console.log(`- ${student}: my-path.md не найден, пропуск`)
    continue
  }
  const original = fs.readFileSync(myPathFile, 'utf-8')
  const { updated, changed } = appendUnitsToMyPath(original, NEW_UNITS_FOR_PATH)
  if (changed) {
    fs.writeFileSync(myPathFile, updated)
    console.log(`  ✓ ${student}: добавлено ${NEW_UNITS_FOR_PATH.length} строк`)
  } else {
    console.log(`- ${student}: уже актуален`)
  }
}

console.log('\n=== Готово ===')
