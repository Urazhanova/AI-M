'use server'

import { octokit } from '@/lib/github'
import { revalidatePath } from 'next/cache'

const owner = process.env.GITHUB_OWNER || "Urazhanova";
const repo = process.env.GITHUB_REPO || "AI-M";

export async function submitSessionResult(
  studentName: string, 
  chunkId: string, 
  dodStatus: string, 
  reflection: string, 
  bloomLevels: string[]
) {
  if (!process.env.GITHUB_TOKEN) {
    return { success: false, error: 'GITHUB_TOKEN is missing in .env.local' }
  }

  try {
    const path = `students/${studentName}/progress.md`
    
    // 1. Fetch current file to get its sha (required for update)
    let currentContent = ''
    let sha = ''
    
    try {
      const response = await octokit.rest.repos.getContent({
        owner,
        repo,
        path,
        ref: 'main' // User requested to commit to main
      })
      
      if (!Array.isArray(response.data) && response.data.type === 'file') {
        currentContent = Buffer.from(response.data.content, 'base64').toString('utf-8')
        sha = response.data.sha
      }
    } catch (e) {
      console.log(`File ${path} not found or error fetching. Proceeding to create new.`)
    }
    
    // 2. Append new session data
    const dateOpts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' }
    const dateStr = new Date().toLocaleDateString('ru-RU', dateOpts)
    
    const newEntry = `\n## Сессия: ${chunkId} (${dateStr})\n- **Статус DoD:** ${dodStatus}\n- **Уровни Блума:** ${bloomLevels.length > 0 ? bloomLevels.join(', ') : 'Не отмечено'}\n- **Рефлексия:** ${reflection}\n`
    
    // If file didn't exist, we add a header
    if (!currentContent) {
      currentContent = `# Прогресс студента: ${studentName}\n`
    }
    
    const updatedContent = currentContent + newEntry
    
    // 3. Commit the change
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `${studentName}: ${chunkId} — ${dodStatus}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha: sha || undefined,
      branch: 'main'
    })
    
    // 4. Revalidate cache so the new data is shown immediately
    revalidatePath(`/curator/student/${studentName}`)
    revalidatePath(`/student`)
    
    return { success: true }
  } catch (error: any) {
    console.error('Failed to commit session result:', error)
    return { success: false, error: error?.message || 'Failed to commit to GitHub' }
  }
}

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function verifyKnowledge(
  studentName: string, 
  chunkId: string, 
  metaContent: string, 
  history: { role: 'user' | 'model', text: string }[],
  message: string,
  isManualEnd: boolean = false
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY не найден в переменных окружения")
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      systemInstruction: `Ты выступаешь в роли заботливого ИИ-тьютора для курса "AI-native организации".
Твоя задача — провести Сократический диалог со студентом и проверить, насколько хорошо он усвоил материал юнита "${chunkId}".

Вопросы для проверки по таксономии Блума из методички:
${metaContent}

ТВОИ ПРАВИЛА:
1. Задавай вопросы по одному. Не вываливай все сразу.
2. Жди ответа студента. Если ответ неполный или слишком общий — задай наводящий вопрос, попроси конкретизировать.
3. Если студент отвечает неверно или "буксует" 2-3 раза подряд на одном и том же — не мучай его. Переходи к следующему вопросу или плавно завершай сессию.
4. Веди диалог естественно. Подбадривай студента.
5. Твоя конечная цель — определить, какие уровни Блума студент реально освоил.

ЗАВЕРШЕНИЕ СЕССИИ:
Если ты считаешь, что студент ответил на все вопросы (успешно или нет), ИЛИ если студент явно попросил завершить тест (досрочно), ты ОБЯЗАН завершить сессию.
Чтобы завершить сессию, напиши свой финальный фидбек текстом (для студента), а в самом конце своего сообщения прикрепи блок JSON вот в таком строгом формате:

\`\`\`json
{
  "achievedBloomLevels": ["Knowledge (Знание)", "Application (Применение)"],
  "isCompleted": true,
  "reflectionForCurator": "Студент хорошо понял теорию, но застрял на практике. Сессия завершена."
}
\`\`\`

Поле "isCompleted" ставь \`true\` если базовый материал усвоен. Если студент бросил на полпути или не смог ответить ни на что — ставь \`false\`.
Никогда не выводи этот JSON, пока диалог продолжается! Только в самом последнем сообщении.`
    })

    let chatHistory = history.map(h => ({
      role: h.role,
      parts: [{ text: h.text }]
    }))

    // Gemini требует, чтобы первое сообщение в истории всегда было от пользователя
    if (chatHistory.length > 0 && chatHistory[0].role === 'model') {
      chatHistory.unshift({
        role: 'user',
        parts: [{ text: 'Привет! Я готов начать проверку знаний.' }]
      })
    }

    const chat = model.startChat({ history: chatHistory })

    let finalMessage = message
    if (isManualEnd) {
      finalMessage = `[СИСТЕМНОЕ СООБЩЕНИЕ]: Студент нажал кнопку "Завершить тест досрочно". Пожалуйста, подведи итоги того, что мы успели обсудить, и выдай финальный фидбек вместе с JSON блоком.`
    }

    const result = await chat.sendMessage(finalMessage)
    const responseText = result.response.text()
    
    // Проверяем, есть ли JSON блок в ответе
    const jsonMatch = responseText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/)
    
    let isSessionEnded = false
    let parsedJson = null

    if (jsonMatch && jsonMatch[1]) {
      isSessionEnded = true
      try {
        parsedJson = JSON.parse(jsonMatch[1].trim())
        
        // Автокоммит
        const dodStatus = parsedJson.isCompleted ? "Completed" : "In Progress"
        await submitSessionResult(
          studentName,
          chunkId,
          dodStatus,
          `[AI Auto-Verification] ${parsedJson.reflectionForCurator}`,
          parsedJson.achievedBloomLevels || []
        )
      } catch (e) {
        console.error("Ошибка парсинга JSON от Gemini", e)
      }
    }

    // Удаляем JSON из текста, чтобы не показывать его студенту
    const cleanResponseText = responseText.replace(/\`\`\`json\n[\s\S]*?\n\`\`\`/, '').trim()

    return { 
      success: true, 
      text: cleanResponseText, 
      isSessionEnded,
      achievedBloomLevels: parsedJson?.achievedBloomLevels || []
    }
  } catch (error) {
    console.error('Error in verifyKnowledge:', error)
    return { success: false, error: String(error) }
  }
}

