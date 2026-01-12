#!/usr/bin/env bash
# Run this on DESKTOP before switching to laptop
set -euo pipefail

REPO_DIR="/Users/joe/VS Code/Bookdarr"

cd "${REPO_DIR}"

echo "=== Switching from Desktop to Laptop ==="
echo ""

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
  echo "📝 You have uncommitted changes. Committing them now..."
  git add -A

  # Ask for commit message or use default
  read -p "Commit message (press Enter for 'WIP: desktop session'): " COMMIT_MSG
  COMMIT_MSG=${COMMIT_MSG:-"WIP: desktop session"}

  git commit -m "${COMMIT_MSG}

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
  echo "✅ Changes committed"
else
  echo "✅ No uncommitted changes"
fi

# Push to remote
echo ""
echo "📤 Pushing to GitHub..."
git push origin develop

echo ""
echo "✅ Desktop work saved to GitHub!"
echo ""
echo "📋 On your laptop, run:"
echo "   cd '/Users/joe/VS Code/Bookdarr' && ./scripts/sync-from-remote.sh"
echo ""
