# Деплой на Render.com

В репозитории есть `render.yaml` (Blueprint) — Render по нему сам создаёт сервис. Тебе остаётся подключить репо и задать секреты.

---

## Шаг 1. Завести аккаунт Render (если ещё нет)

1. Зайти на [render.com](https://render.com) → Sign up
2. Войти через GitHub-аккаунт `Urazhanova` (так быстрее: подключение к репо уже будет)

## Шаг 2. Создать сервис из Blueprint

1. В дашборде Render: **New** → **Blueprint**
2. Выбрать репозиторий `Urazhanova/AI-M`
3. Render прочитает `render.yaml` в корне и предложит создать сервис `ai-mindset-tracker`
4. На экране Render покажет, что **5 переменных требуют значения** (они помечены `sync: false` в yaml):

   | Переменная | Что вписывать |
   |---|---|
   | `GITHUB_TOKEN` | твой GitHub Personal Access Token (тот, что в `.env.local`) |
   | `GEMINI_API_KEY` | твой ключ от Google AI Studio |
   | `NEXT_PUBLIC_SUPABASE_URL` | URL Supabase-проекта (можно пропустить, если auth не нужна) |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (можно пропустить) |

   `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH`, `NODE_VERSION` подставятся из yaml автоматически.

5. Нажать **Apply** → Render склонирует ветку `front` и запустит первый билд

## Шаг 3. Дождаться деплоя

- Билд занимает ~3–5 минут (npm install + next build)
- Логи видно в дашборде Render
- После `==> Build successful` → `==> Deploying...` → `Your service is live` сервис доступен по адресу `https://ai-mindset-tracker.onrender.com`

## Шаг 4. Проверить

Открыть `https://ai-mindset-tracker.onrender.com` — должна появиться страница выбора роли.

Базовая проверка:
1. **Роль студента** → выбрать Ирину → должна показаться её карточка с прогрессом 12/15
2. **Роль куратора** → должны быть видны 15 чанков и 3 студента
3. **Куратор → Загрузить транскрипт** — UI открывается. Реальную загрузку не запускать, пока не убеждена в `GITHUB_TOKEN` (запись в `front` пойдёт сразу).

## Особенности

### Free-tier и засыпание

Бесплатный план Render усыпляет сервис после 15 минут без трафика. Первый запрос после паузы холодный (~30–60 сек) — это нормально.

### Auto-deploy

`autoDeploy: true` в `render.yaml` → каждый `git push origin front` запускает новый билд автоматически. Если хочется деплоить только вручную — поменять на `autoDeploy: false`.

### Регион

Сейчас стоит `frankfurt` (ближе к Казахстану и Европе по латентности). Альтернативы: `oregon`, `ohio`, `singapore`, `frankfurt`. Менять можно в `render.yaml` и Render пересоздаст сервис.

### Логи

В дашборде Render → твой сервис → вкладка **Logs**. Здесь видно:
- Запросы к страницам
- Ошибки от GitHub/Gemini API
- Build-логи

### Если что-то не работает

| Симптом | Где смотреть |
|---|---|
| Сервис не стартует | Render Logs → ошибка из `npm run start` |
| Дашборд показывает 0 чанков | Не задан `GITHUB_TOKEN` или у токена нет прав на `Urazhanova/AI-M` |
| Загрузка транскрипта падает | Не задан `GEMINI_API_KEY`, или у токена нет contents:write |
| Все страницы 500 | `.env` не подхватились — проверить, что переменные сохранены в Render Dashboard → Environment |

---

## Альтернативный путь: вручную (без Blueprint)

Если по какой-то причине Blueprint не сработал:

1. **New** → **Web Service**
2. Connect GitHub → выбрать `Urazhanova/AI-M`
3. Заполнить форму:
   - Name: `ai-mindset-tracker`
   - Region: `Frankfurt`
   - Branch: `front`
   - Root Directory: `web`
   - Runtime: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Plan: `Free`
4. **Advanced** → добавить env-переменные вручную:
   - `NODE_VERSION` = `20`
   - `GITHUB_TOKEN` = свой токен
   - `GITHUB_OWNER` = `Urazhanova`
   - `GITHUB_REPO` = `AI-M`
   - `GITHUB_BRANCH` = `front`
   - `GEMINI_API_KEY` = свой ключ
   - (опционально) `NEXT_PUBLIC_SUPABASE_*`
5. **Create Web Service**

---

## Чек-лист до первого деплоя

- [ ] GitHub-токен валиден и имеет contents (read+write) на `Urazhanova/AI-M`
- [ ] Gemini-ключ начинается с `AIza...` и не превышен дневной лимит
- [ ] Ветка `front` запушена (последний коммит виден на github.com/Urazhanova/AI-M)
- [ ] `render.yaml` в корне репозитория (не в подпапке)
- [ ] Локально `npm run build` в `web/` проходит без ошибок (✓ проверено)
