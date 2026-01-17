#!/usr/bin/env bash
#
# Removes books from the user's library (via /user/library/{bookId} DELETE) without deleting files.
# This is the same endpoint used by the Book Pool corner control.
#
# Required env:
#   API_KEY   - Bookdarr API key (Settings -> General -> API Key)
# Optional env:
#   BASE_URL  - Base URL of your instance (default: https://bookdarr.shiznit.duckdns.org)
#   DRY_RUN   - If set to "true", only print the bookIds that would be removed.
#
# Example:
#   API_KEY=abc123 ./scripts/remove-library-books.sh
#
set -euo pipefail

BASE_URL="${BASE_URL:-https://bookdarr.shiznit.duckdns.org}"
DRY_RUN="${DRY_RUN:-false}"

if ! command -v jq >/dev/null 2>&1; then
  echo "jq is required (brew install jq or apt-get install jq)" >&2
  exit 1
fi

if [ -z "${API_KEY:-}" ]; then
  echo "API_KEY is required (from Settings -> General -> API Key)" >&2
  exit 1
fi

echo "Fetching Book Pool entries from ${BASE_URL}..."
book_ids=$(curl -fsS -H "X-Api-Key: ${API_KEY}" "${BASE_URL}/user/library/pool" | jq -r '.[] | select(.inMyLibrary==true) | .bookId')

if [ -z "${book_ids}" ]; then
  echo "No in-library books found to remove."
  exit 0
fi

echo "Found the following bookIds to remove from library:"
echo "${book_ids}"

if [ "${DRY_RUN}" = "true" ]; then
  echo "DRY_RUN=true, exiting without changes."
  exit 0
fi

while read -r id; do
  if [ -z "${id}" ]; then
    continue
  fi
  echo "Removing bookId=${id}..."
  curl -fsS -X DELETE -H "X-Api-Key: ${API_KEY}" "${BASE_URL}/user/library/${id}" >/dev/null
done <<< "${book_ids}"

echo "Done. Refresh Book Pool to add items back via the corner control."
