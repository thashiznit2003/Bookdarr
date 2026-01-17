#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-/opt/bookdarr-dev}"
RID="${RID:-linux-x64}"

if [ ! -d "${REPO_DIR}" ]; then
  echo "Repo not found at ${REPO_DIR}. Run dev-setup-ubuntu.sh first." >&2
  exit 1
fi

cd "${REPO_DIR}"

if ! command -v yarn >/dev/null 2>&1; then
  echo "Yarn is not installed. Run dev-setup-ubuntu.sh first." >&2
  exit 1
fi

export BROWSERSLIST_IGNORE_OLD_DATA=1

yarn install --frozen-lockfile --network-timeout 120000
NODE_ENV=production yarn build --env production=true

restoreArgs=()

if [ "${RESTORE_NO_CACHE:-}" = "true" ]; then
  restoreArgs+=("-p:RestoreNoCache=true" "-p:RestoreDisableParallel=true")
fi

dotnet msbuild -restore src/Readarr.sln -p:Configuration=Release -p:Platform=Posix -p:RuntimeIdentifiers=${RID} -t:PublishAllRids "${restoreArgs[@]}"

ui_src="${REPO_DIR}/_output/UI"
ui_dest="${REPO_DIR}/_output/net10.0/${RID}/UI"

if [ -d "${ui_src}" ]; then
  rm -rf "${ui_dest}"
  mkdir -p "${ui_dest}"
  cp -a "${ui_src}/." "${ui_dest}/"
fi

echo "Build complete. Run dev-run.sh to start Bookdarr."
