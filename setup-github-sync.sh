#!/bin/bash
# Скрипт первичной синхронизации AI-M с GitHub
# Запустить один раз: bash ~/Desktop/AI-M/setup-github-sync.sh

set -e

REPO_DIR="$HOME/Desktop/AI-M"
REMOTE_URL="https://github.com/Urazhanova/AI-M.git"

echo "📁 Переходим в папку проекта..."
cd "$REPO_DIR"

# Инициализация git (если ещё не сделана)
if [ ! -d ".git" ]; then
  echo "🔧 Инициализируем git..."
  git init
  git branch -m main
else
  echo "✅ Git уже инициализирован"
fi

# Настройка пользователя
git config user.email "urazhanova.kz@gmail.com"
git config user.name "Irina Urazhanova"

# Добавление remote (если ещё нет)
if ! git remote | grep -q origin; then
  echo "🔗 Добавляем remote origin..."
  git remote add origin "$REMOTE_URL"
else
  echo "✅ Remote origin уже настроен"
  git remote set-url origin "$REMOTE_URL"
fi

# .gitignore
cat > .gitignore << 'GITIGNORE'
# Временные файлы Office
~$*
*.tmp
*.bak

# macOS
.DS_Store
.AppleDouble
.LSOverride

# Входящие (рабочая зона, не архив)
inbox/
GITIGNORE

echo "📦 Добавляем все файлы..."
git add -A

echo "💾 Создаём первый коммит..."
git commit -m "Initial commit: AI-M learning tracker" 2>/dev/null || echo "ℹ️ Нечего коммитить или коммит уже существует"

echo "🚀 Пушим в GitHub..."
git push -u origin main

echo ""
echo "✅ Готово! Проект синхронизирован с https://github.com/Urazhanova/AI-M"
