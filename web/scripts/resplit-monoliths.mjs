// Одноразовый пересплит трёх монолитных чанков, созданных старым пайплайном.
// Для каждого: разбивает транскрипт на под-юниты через Gemini, генерирует
// content.md и meta.md, удаляет старый монолит, обновляет sequence.md
// и my-path.md всех студентов.
//
// Запуск: cd web && node scripts/resplit-monoliths.mjs

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { GoogleGenerativeAI } from '@google/generative-ai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, '../..')

// Загрузить .env.local
const envPath = path.resolve(__dirname, '../.env.local')
for (const line of fs.readFileSync(envPath, 'utf-8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m && m[2]) process.env[m[1]] = m[2].trim()
}

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) { console.error('GEMINI_API_KEY не найден'); process.exit(1) }

const genAI = new GoogleGenerativeAI(apiKey)
const splitModel = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' },
})
const contentModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

const TARGETS = [
  {
    oldChunkId: 's3-w1-lecture',
    transcript: 'raw/s3-w1-lecture-transcript-2026-05-07.md',
    chunkIdHint: 's3-w1-lecture',
    fallbackPrereqs: ['s3-intro'],
  },
  {
    oldChunkId: 's3-w1-workshop',
    transcript: 'raw/s3-w1-workshop-transcript-2026-05-09.md',
    chunkIdHint: 's3-w1-workshop',
    fallbackPrereqs: ['s3-w1-lecture'],
  },
  {
    oldChunkId: 's3-w2-lecture',
    transcript: 'raw/s3-w2-lecture-transcript-2026-05-09.md',
    chunkIdHint: 's3-w2-lecture',
    fallbackPrereqs: ['s3-w1-workshop-setup'],
  },
]

function cleanJson(raw) {
  return raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/, '').trim()
}

function parseChunkId(chunkId) {
  const m = chunkId.match(/^s(\d+)(?:-w(\d+))?/i)
  if (!m) return { sprint: 's?', week: '?' }
  const sprint = `s${m[1]}`
  const week = m[2] ? `w${m[2]}` : (chunkId.includes('-intro') ? 'intro' : 'w?')
  return { sprint, week }
}

function buildSplitPrompt(transcript, chunkIdHint) {
  return `Ты методист курса "AI-native организации".
Раздели транскрипт на самостоятельные учебные юниты. Юнит — смысловая единица, которую можно изучить отдельно (одна крупная идея/тема/практика). Лекция 1.5–2 часа обычно даёт 2–5 юнитов. Не дроби слишком мелко: один юнит = 20–40 минут материала минимум.

ТРАНСКРИПТ:
"""
${transcript}
"""

Подсказка по базовому ID от куратора: "${chunkIdHint}". Используй как основу. Если юнитов несколько — добавляй суффиксы -a, -b, -c.

Верни JSON строго в формате:
{
  "units": [
    {
      "chunkId": "${chunkIdHint}-a",
      "title": "Явное название юнита на русском",
      "type": "lecture",
      "date": "YYYY-MM-DD",
      "prerequisites": [],
      "speaker": "Имя или пустая строка",
      "scope_summary": "2-3 предложения о содержании юнита"
    }
  ]
}

Правила:
- chunkId: только строчные латинские, цифры, дефисы. Если 1 юнит — без суффикса; если несколько — -a, -b, -c.
- type: lecture | practical | workshop | intro
- prerequisites: для первого юнита оставь пустым; для последующих — предыдущий юнит из этого же набора (например ["${chunkIdHint}-a"])
- Минимум 1, максимум 6 юнитов
- Не добавляй текст вне JSON`
}

function buildContentPrompt({ transcript, chunkId, title, type, date, speaker, scope_summary }) {
  return `Ты методист курса "AI-native организации".
Извлеки из транскрипта ТОЛЬКО ту часть, которая относится к юниту, и оформи как учебный материал на русском в Markdown.

ТРАНСКРИПТ ПОЛНОСТЬЮ:
"""
${transcript}
"""

Юнит: "${title}" (${chunkId})
Содержание этого юнита (что брать): ${scope_summary}

Правила:
- Заголовок H1: "# ${title}"
- Метаблок: **Дата:** ${date}, **Формат:** ${type}, **Спикер:** ${speaker || 'не указан'}
- Раздели на H2/H3
- Бери ТОЛЬКО фрагменты транскрипта, относящиеся к scope этого юнита
- Убери повторы, слова-паразиты, артефакты
- Сохрани ключевые идеи, примеры, выводы из своего scope
- Минимум 400 слов
- Только Markdown, без JSON`
}

function buildMetaPrompt({ chunkId, title, type, date, sprint, week, speaker, prerequisites, contentMd }) {
  const prereqYaml = prerequisites.join(', ')
  return `Ты методист курса "AI-native организации".
Создай файл метаданных для юнита "${title}" (${chunkId}) СТРОГО по шаблону ниже.

Краткое содержание юнита (первые 3000 символов content.md):
"""
${contentMd.substring(0, 3000)}
"""

Параметры:
- chunkId: ${chunkId}, title: ${title}, session_type: ${type}, date: ${date}
- sprint: ${sprint}, week: ${week}, speaker: ${speaker || 'не указан'}
- prerequisites: [${prereqYaml}]

Таксономия Блума:
1 — Помнит, 2 — Понимает, 3 — Применяет, 4 — Анализирует, 5 — Оценивает, 6 — Создаёт.

Верни Markdown ровно по этому шаблону:

# meta: ${chunkId}

\`\`\`yaml
id: ${chunkId}
title: "${title}"
session_type: ${type}
date: ${date}
duration_min: <число>
sprint: ${sprint}
week: ${week}
position: 0
speaker: "${speaker || ''}"
\`\`\`

## Learning Outcomes (с таксономией Блума)

### Knowledge — что студент должен помнить и понимать
| Знание | Уровень Блума |
|---|---|
| <фактическое знание> | 1 |
| <концепция> | 2 |
| <принцип> | 2 |

### Skills — что студент должен уметь делать
| Навык | Уровень Блума |
|---|---|
| <умение> | 3 |
| <умение анализа> | 4 |
| <умение оценки> | 5 |

### Attitudes — какие установки и mindset-сдвиги формирует юнит
| Установка | Уровень Блума |
|---|---|
| <установка> | 4 |
| <принцип> | 5 |

## Проверка усвоения

### Знание (Knowledge)
- <вопрос>
- <вопрос>

### Понимание (Comprehension)
- <вопрос>
- <вопрос>

### Применение (Application)
- <вопрос>
- <вопрос>

### Анализ (Analysis)
- <вопрос>
- <вопрос>

### Синтез (Synthesis)
- <вопрос>
- <вопрос>

### Оценка (Evaluation)
- <вопрос>
- <вопрос>

## Definition of Done

### Минимальный DoD (Bloom 1-3)
- <артефакт>
- <артефакт>

### Полный DoD (Bloom 4-6)
- <артефакт>
- <артефакт>

## Граф связей

\`\`\`yaml
prerequisites: [${prereqYaml}]
leads_to: []
related: []
\`\`\`
`
}

// ─────────────────────────────────────────────────────────────────
// Main
// ─────────────────────────────────────────────────────────────────

console.log('=== Пересплит монолитов через новый пайплайн ===\n')

const replacements = new Map() // oldChunkId -> [{chunkId, title, type, date, prerequisites}, ...]

for (const target of TARGETS) {
  console.log(`### ${target.oldChunkId}`)
  console.log(`  источник: ${target.transcript}`)

  const transcriptFull = fs.readFileSync(path.join(repoRoot, target.transcript), 'utf-8')
  const truncated = transcriptFull.substring(0, 60000)

  // Step 1: Split
  const splitRes = await splitModel.generateContent(buildSplitPrompt(truncated, target.chunkIdHint))
  let units = []
  try {
    const parsed = JSON.parse(cleanJson(splitRes.response.text().trim()))
    units = Array.isArray(parsed.units) ? parsed.units : []
  } catch (e) {
    console.error(`  ❌ split parse error:`, e.message)
    continue
  }
  if (units.length === 0) { console.error(`  ❌ no units`); continue }
  console.log(`  → split: ${units.length} юнит(ов)`)

  // Step 2: For each unit — content + meta
  const created = []
  for (let i = 0; i < units.length; i++) {
    const spec = units[i]
    const { chunkId, title, type, scope_summary } = spec
    if (!chunkId || !title) { console.error(`  ❌ bad spec:`, spec); continue }

    const safeDate = spec.date || new Date().toISOString().split('T')[0]
    const safeType = type || 'lecture'
    const speaker = spec.speaker || ''
    // Если первый юнит — берём prereq из old; иначе предыдущий из этого же сплита
    let safePrereqs
    if (Array.isArray(spec.prerequisites) && spec.prerequisites.length > 0) {
      safePrereqs = spec.prerequisites
    } else if (i === 0) {
      safePrereqs = target.fallbackPrereqs
    } else {
      safePrereqs = [created[created.length - 1].chunkId]
    }

    const contentMd = (await contentModel.generateContent(
      buildContentPrompt({ transcript: truncated, chunkId, title, type: safeType, date: safeDate, speaker, scope_summary: scope_summary || title })
    )).response.text().trim()

    const { sprint, week } = parseChunkId(chunkId)
    const metaMd = (await contentModel.generateContent(
      buildMetaPrompt({ chunkId, title, type: safeType, date: safeDate, sprint, week, speaker, prerequisites: safePrereqs, contentMd })
    )).response.text().trim()

    const dir = path.join(repoRoot, 'course', chunkId)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'content.md'), contentMd + '\n')
    fs.writeFileSync(path.join(dir, 'meta.md'), metaMd + '\n')

    created.push({ chunkId, title, type: safeType, date: safeDate, prerequisites: safePrereqs })
    console.log(`    ✓ ${chunkId}: ${title.substring(0, 60)}`)
  }

  replacements.set(target.oldChunkId, created)
  console.log('')
}

// Step 3: Удалить старые монолиты, если их ID не в новых
console.log('=== Удаление старых монолитов ===')
for (const [oldId, newChunks] of replacements) {
  if (newChunks.some(c => c.chunkId === oldId)) {
    console.log(`= ${oldId}: переписан тем же ID, не удаляем`)
    continue
  }
  const dir = path.join(repoRoot, 'course', oldId)
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true })
    console.log(`✗ удалён course/${oldId}/`)
  }
}
console.log('')

// Step 4: Обновить prereqs в оставшихся чанках (заменить старые ID на последний под-юнит)
console.log('=== Обновление prereqs в смежных чанках ===')
const chunkDirs = fs.readdirSync(path.join(repoRoot, 'course'))
  .filter(d => fs.statSync(path.join(repoRoot, 'course', d)).isDirectory())
for (const cd of chunkDirs) {
  const metaPath = path.join(repoRoot, 'course', cd, 'meta.md')
  if (!fs.existsSync(metaPath)) continue
  let content = fs.readFileSync(metaPath, 'utf-8')
  let changed = false
  for (const [oldId, newChunks] of replacements) {
    // Не трогаем сами новые сабюниты
    if (newChunks.some(c => c.chunkId === cd)) continue
    if (cd === oldId) continue // (если был кейс «переписан тем же ID»)
    const last = newChunks[newChunks.length - 1].chunkId
    // Замена с word-boundary через lookahead — чтобы "s3-w1-lecture" не попало в "s3-w1-lecture-a"
    const re = new RegExp(`\\b${oldId.replace(/-/g, '\\-')}(?![-\\w])`, 'g')
    if (re.test(content)) {
      content = content.replace(re, last)
      changed = true
    }
  }
  if (changed) {
    fs.writeFileSync(metaPath, content)
    console.log(`  ✓ ${cd}/meta.md prereqs обновлены`)
  }
}
console.log('')

// Step 5: Перегенерировать sequence.md (yaml-блоки в порядке: intro → w1 → w2)
console.log('=== Регенерация sequence.md ===')
const allChunks = fs.readdirSync(path.join(repoRoot, 'course'))
  .filter(d => fs.statSync(path.join(repoRoot, 'course', d)).isDirectory())
  .sort((a, b) => {
    // intro первым, дальше по w{N} и по chunkId
    const aIntro = a.includes('intro')
    const bIntro = b.includes('intro')
    if (aIntro && !bIntro) return -1
    if (!aIntro && bIntro) return 1
    return a.localeCompare(b)
  })

function extractMetaYaml(metaContent) {
  const m = metaContent.match(/```yaml\n([\s\S]*?)\n```/)
  if (!m) return null
  const yaml = m[1]
  const get = (key) => {
    const r = yaml.match(new RegExp(`^${key}:\\s*"?([^\n"]+)"?`, 'm'))
    return r ? r[1].trim().replace(/^"|"$/g, '') : ''
  }
  return {
    id: get('id'),
    title: get('title'),
    date: get('date'),
    type: get('session_type'),
  }
}

function extractGraphYaml(metaContent) {
  // Из секции "## Граф связей"
  const m = metaContent.match(/##\s+Граф\s+связей\s*\n+```yaml\n([\s\S]*?)\n```/)
  if (!m) return { prerequisites: [], leads_to: [], related: [] }
  const yaml = m[1]
  const arr = (key) => {
    const r = yaml.match(new RegExp(`^${key}:\\s*\\[([^\\]]*)\\]`, 'm'))
    if (!r) return []
    return r[1].split(',').map(s => s.trim()).filter(Boolean)
  }
  return {
    prerequisites: arr('prerequisites'),
    leads_to: arr('leads_to'),
    related: arr('related'),
  }
}

const yamlBlocks = []
for (const cd of allChunks) {
  const metaPath = path.join(repoRoot, 'course', cd, 'meta.md')
  const meta = fs.readFileSync(metaPath, 'utf-8')
  const head = extractMetaYaml(meta)
  const graph = extractGraphYaml(meta)
  if (!head) continue
  yamlBlocks.push(`### ${head.id}
\`\`\`yaml
id: ${head.id}
title: "${head.title}"
date: ${head.date}
type: ${head.type}
prerequisites: [${graph.prerequisites.join(', ')}]
leads_to: [${graph.leads_to.join(', ')}]
related: [${graph.related.join(', ')}]
\`\`\`
`)
}

const sequenceContent = `# sequence.md — Граф последовательности чанков

Это не линейный список, а **граф связей** между чанками.
Каждый чанк имеет: пререквизиты, продолжение, смежные материалы.

Источник правды для названий, дат и связей — \`course/[chunk-id]/meta.md\`. Этот файл генерируется из \`meta.md\` и не должен правиться вручную для смены имён или дат.

---

## Граф (визуальное представление)

> Обновляется вручную после изменений. Скрипт пересплита эту секцию не пересоздаёт.

\`\`\`
${chunkDirs.length > 0 ? '<автогенерация графа не реализована — обновить вручную>' : ''}
\`\`\`

---

## Узлы графа

${yamlBlocks.join('\n')}

---

## Возможные пути прохождения

> Обновляется вручную после изменений в графе.

---

## Как обновлять

Правила см. \`docs/lecture-pipeline.md\`. yaml-блоки выше регенерируются автоматически из \`meta.md\` при загрузке/пересплите. Связи (\`leads_to\`, \`related\`) задаются в \`meta.md\` каждого чанка.
`

fs.writeFileSync(path.join(repoRoot, 'course/sequence.md'), sequenceContent)
console.log(`  ✓ course/sequence.md перегенерирован (${yamlBlocks.length} узлов)`)
console.log('')

// Step 6: Обновить my-path.md студентов
console.log('=== Обновление my-path.md студентов ===')

function updateMyPath(content, replacementsMap) {
  const lines = content.split('\n')
  const sectionIdx = lines.findIndex(l => /^##\s+Текущий\s+статус/i.test(l))
  if (sectionIdx === -1) return { updated: content, changed: false }

  let tableStart = -1
  for (let i = sectionIdx + 1; i < lines.length; i++) {
    if (lines[i].startsWith('|')) { tableStart = i; break }
    if (lines[i].startsWith('##')) return { updated: content, changed: false }
  }
  if (tableStart === -1) return { updated: content, changed: false }
  let tableEnd = tableStart
  while (tableEnd + 1 < lines.length && lines[tableEnd + 1].startsWith('|')) tableEnd++

  let changed = false
  const newRows = []
  for (let i = tableStart; i <= tableEnd; i++) {
    const line = lines[i]
    const m = line.match(/^\|\s*([\w-]+)\s*\|/)
    if (!m) { newRows.push(line); continue }
    const chunkId = m[1]
    if (replacementsMap.has(chunkId)) {
      const subUnits = replacementsMap.get(chunkId)
      // Извлекаем cells из старой строки
      const cells = line.split('|').map(c => c.trim())
      // cells: ["", chunkId, type, status, bloom, dod, ""]
      const status = cells[3] || '⬜ не начат'
      const bloom = cells[4] || '—'
      const dod = cells[5] || '—'
      // Если у первого был uniq stat — переносим на все саб-юниты
      for (const sub of subUnits) {
        newRows.push(`| ${sub.chunkId} | ${sub.type} | ${status} | ${bloom} | ${dod} |`)
      }
      changed = true
    } else {
      newRows.push(line)
    }
  }

  if (!changed) return { updated: content, changed: false }
  return {
    updated: [...lines.slice(0, tableStart), ...newRows, ...lines.slice(tableEnd + 1)].join('\n'),
    changed: true,
  }
}

const studentsDir = path.join(repoRoot, 'students')
const students = fs.readdirSync(studentsDir).filter(s =>
  fs.statSync(path.join(studentsDir, s)).isDirectory()
)
for (const student of students) {
  const myPathFile = path.join(studentsDir, student, 'my-path.md')
  if (!fs.existsSync(myPathFile)) continue
  const original = fs.readFileSync(myPathFile, 'utf-8')
  const { updated, changed } = updateMyPath(original, replacements)
  if (changed) {
    fs.writeFileSync(myPathFile, updated)
    console.log(`  ✓ ${student}/my-path.md обновлён`)
  } else {
    console.log(`- ${student}: без изменений`)
  }
}

console.log('\n=== Готово ===')
console.log('Старые монолиты удалены, новые суб-юниты сохранены, sequence.md и my-path.md обновлены.')
