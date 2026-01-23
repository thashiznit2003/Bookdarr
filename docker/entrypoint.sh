#!/usr/bin/env sh
set -e

APP_BIN="${BOOKDARR_BIN:-/app/readarr/bin/Readarr}"
DATA_DIR="${BOOKDARR_DATA_DIR:-/config}"
RUN_USER="${BOOKDARR_USER:-bookdarr}"
RUN_GROUP="${BOOKDARR_GROUP:-bookdarr}"
PUID="${PUID:-1000}"
PGID="${PGID:-1000}"

ensure_user() {
  if ! getent group "${RUN_GROUP}" >/dev/null 2>&1; then
    addgroup -g "${PGID}" -S "${RUN_GROUP}"
  else
    existing_gid="$(getent group "${RUN_GROUP}" | cut -d: -f3 || true)"
    if [ -n "${existing_gid}" ] && [ "${existing_gid}" != "${PGID}" ]; then
      delgroup "${RUN_GROUP}" >/dev/null 2>&1 || true
      addgroup -g "${PGID}" -S "${RUN_GROUP}"
    fi
  fi

  if ! id "${RUN_USER}" >/dev/null 2>&1; then
    adduser -S -D -H -u "${PUID}" -G "${RUN_GROUP}" "${RUN_USER}"
  else
    existing_uid="$(id -u "${RUN_USER}" 2>/dev/null || true)"
    if [ -n "${existing_uid}" ] && [ "${existing_uid}" != "${PUID}" ]; then
      deluser "${RUN_USER}" >/dev/null 2>&1 || true
      adduser -S -D -H -u "${PUID}" -G "${RUN_GROUP}" "${RUN_USER}"
    fi
  fi
}

if [ "$(id -u)" = "0" ]; then
  ensure_user
  mkdir -p "${DATA_DIR}"
  chown -R "${PUID}:${PGID}" "${DATA_DIR}"
  exec su-exec "${RUN_USER}:${RUN_GROUP}" "${APP_BIN}" "/data=${DATA_DIR}" "/nobrowser" "$@"
fi

mkdir -p "${DATA_DIR}"
exec "${APP_BIN}" "/data=${DATA_DIR}" "/nobrowser" "$@"
