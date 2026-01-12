#!/usr/bin/env bash
# Run this when arriving at either machine to sync latest changes
set -euo pipefail

REPO_DIR="/Users/joe/VS Code/Bookdarr"

cd "${REPO_DIR}"

# Detect which machine we're on
MACHINE="unknown"
if [ "$(hostname)" = "Joes-Mac-mini.local" ]; then
  MACHINE="desktop"
else
  MACHINE="laptop"
fi

echo "=== Syncing to ${MACHINE} ==="
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️  WARNING: You have uncommitted changes!"
  echo ""
  git status --short
  echo ""
  read -p "Stash these changes? (y/n): " STASH_CHOICE

  if [ "${STASH_CHOICE}" = "y" ] || [ "${STASH_CHOICE}" = "Y" ]; then
    git stash save "Auto-stash before sync on ${MACHINE} $(date)"
    echo "✅ Changes stashed"
  else
    echo "❌ Aborting sync. Commit or stash your changes first."
    exit 1
  fi
fi

# Fetch and pull latest
echo "📥 Pulling latest changes from GitHub..."
git fetch origin
git pull origin develop

echo ""
MACHINE_DISPLAY="$(echo ${MACHINE} | sed 's/./\U&/')"
echo "✅ ${MACHINE_DISPLAY} is now up to date!"
echo ""

# Check if there are stashed changes
STASH_COUNT=$(git stash list | wc -l)
if [ "${STASH_COUNT}" -gt 0 ]; then
  echo "📦 You have ${STASH_COUNT} stashed change(s)"
  echo "   To restore: git stash pop"
  echo ""
fi

# Show recent commits
echo "📜 Recent commits:"
git log --oneline -5

echo ""
echo "🚀 Ready to work on ${MACHINE}!"
echo ""
