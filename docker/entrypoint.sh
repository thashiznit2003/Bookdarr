#!/usr/bin/env sh
set -e

APP_BIN="${BOOKDARR_BIN:-/app/readarr/bin/Readarr}"
DATA_DIR="${BOOKDARR_DATA_DIR:-/config}"

mkdir -p "${DATA_DIR}"

exec "${APP_BIN}" "/data=${DATA_DIR}" "/nobrowser" "$@"
