#!/bin/bash
# Быстрая синхронизация с GitHub
# Запуск: bash ~/Desktop/AI-M/sync.sh "сообщение коммита"

cd ~/Desktop/AI-M
git pull --rebase origin main
git add -A
MSG="${1:-auto-sync $(date '+%Y-%m-%d %H:%M')}"
git commit -m "$MSG" 2>/dev/null || echo "ℹ️ Нечего коммитить"
git push origin HEAD:main
echo "✅ Синхронизировано с GitHub"
