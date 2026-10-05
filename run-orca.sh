#!/usr/bin/env bash
# ORCA launcher for macOS and Linux — the counterpart of RUN-ORCA.bat.
#
#   ./run-orca.sh            build if needed, serve, open the browser
#   PORT=9000 ./run-orca.sh  serve on another port
#
# Reads .env from the repo root when present (see .env.example).
set -euo pipefail

cd "$(dirname "$0")"
ROOT="$(pwd)"

say()  { printf '  %s\n' "$*"; }
fail() { printf '  [x] %s\n' "$*" >&2; exit 1; }

if [[ -f .env ]]; then
  set -a; . ./.env; set +a
  say "[ok] loaded .env"
fi
PORT="${PORT:-8000}"

# ---- python 3.10+ ----------------------------------------------------------
PY="$(command -v python3 || command -v python || true)"
[[ -n "$PY" ]] || fail "Python 3.10+ is required: https://python.org"
"$PY" -c 'import sys; sys.exit(0 if sys.version_info >= (3, 10) else 1)' \
  || fail "Python 3.10+ is required (found $("$PY" --version 2>&1))."
say "[ok] $("$PY" --version 2>&1)"

# ---- backend packages (installed once) --------------------------------------
if ! "$PY" -c 'import fastapi, uvicorn, pydantic, httpx' 2>/dev/null; then
  say "[..] installing backend packages (one time)"
  "$PY" -m pip install --quiet --disable-pip-version-check -r backend/requirements.txt \
    || fail "pip install failed — try: $PY -m pip install -r backend/requirements.txt"
fi
say "[ok] backend packages"

# ---- frontend build (only when missing or older than its sources) -----------
DIST="frontend/dist/index.html"
if [[ ! -f "$DIST" ]] || [[ -n "$(find frontend/src frontend/index.html -newer "$DIST" -print -quit)" ]]; then
  command -v npm >/dev/null || fail "npm is needed to build the frontend: https://nodejs.org"
  say "[..] building the frontend"
  (cd frontend && { [[ -d node_modules ]] || npm install --no-audit --no-fund; } && npm run build) \
    || fail "frontend build failed"
fi
say "[ok] frontend build"

# ---- port ------------------------------------------------------------------
if command -v lsof >/dev/null && lsof -iTCP:"$PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  fail "port $PORT is busy — run with PORT=<free port> ./run-orca.sh"
fi

URL="http://127.0.0.1:${PORT}/"
say "[>>] ORCA on $URL  (Ctrl+C to stop)"
( sleep 3
  if command -v open >/dev/null; then open "$URL"
  elif command -v xdg-open >/dev/null; then xdg-open "$URL" >/dev/null 2>&1
  fi ) &

cd "$ROOT/backend"
exec "$PY" -m uvicorn app.main:app --host 127.0.0.1 --port "$PORT"
