#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-bookdarr.shiznit.duckdns.org}"
PROFILE="${HOME}/Library/Application Support/Google/Chrome/Default"

echo "Stopping Google Chrome (if running) so we can safely clear cached data..."
osascript -e 'tell application "Google Chrome" to quit' >/dev/null 2>&1 || true

sleep 1

declare -a CACHE_PATHS=(
  "Service Worker/CacheStorage"
  "Service Worker/Database"
  "Service Worker/ScriptCache"
  "Service Worker/ScriptCacheStorage"
  "Network Action Predictor"
  "Code Cache"
  "Cache"
  "Service Worker/OriginWideQuota"
)

echo "Removing Chrome cache folders that could include the old Bookdarr bundle..."
for REL in "${CACHE_PATHS[@]}"; do
  TARGET="${PROFILE}/${REL}"
  if [[ -e "${TARGET}" ]]; then
    rm -rf "${TARGET}"
  fi
done

echo "Clearing Bookdarr-specific storage (service worker / DOM storage)..."
rm -rf "${PROFILE}/Storage/ext/https_${DOMAIN}_0"
rm -rf "${PROFILE}/Service Worker/DOMStorage/http_${DOMAIN}_0"

echo "Restarting Chrome and opening https://${DOMAIN} for a fresh load..."
open -a "Google Chrome" "https://${DOMAIN}"

cat <<'EOF'
Now that Chrome is running again:
 1. Open DevTools → Network and check “Disable cache.”
 2. Press Cmd+Shift+R (or select “Empty Cache and Hard Reload”) to force-download the current build.
 3. If needed, re-open DevTools → Application → Service Workers and click “Unregister” or “Stop” to remove the old worker.
EOF
