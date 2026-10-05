"""ORCA API entrypoint.

    uvicorn app.main:app --reload --port 8000
"""
from __future__ import annotations

import mimetypes
import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from . import __version__
from .api import alerts, chat, field, fishing, forecast, map as map_api, routes
from .config import get_data_mode

app = FastAPI(
    title="ORCA — Marine EcOsystem Reasoning with Collaborative Agents",
    description=(
        "SIH26176 · A crew of cooperating AI agents that turns Indian marine data "
        "into one safe, explainable decision for fishers.\n\n"
        "**Safety note:** ORCA is decision support. It does not replace official "
        "IMD / INCOIS advisories or Coast Guard instructions."
    ),
    version=__version__,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # hackathon demo; lock down per-origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Outlooks, traces and flow fields are JSON-heavy; over a weak coastal
# connection compression is the difference between seconds and a timeout.
app.add_middleware(GZipMiddleware, minimum_size=1024)

app.include_router(chat.router)
app.include_router(fishing.router)
app.include_router(forecast.router)
app.include_router(map_api.router)
app.include_router(alerts.router)
app.include_router(routes.router)
app.include_router(field.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok", "version": __version__, "data_mode": get_data_mode(),
            "agents": ["intent", "planner", "weather", "ocean", "pfz", "cyclone",
                       "gis", "risk", "route", "explanation"]}


# --- serve the built frontend if it exists --------------------------------
# Python takes MIME types from the Windows registry, where some installs map
# .js to text/plain — the browser then refuses to run the module bundle and
# the page stays blank. Pin every type the build emits.
for _mime, _ext in (
    ("text/javascript", ".js"),
    ("text/css", ".css"),
    ("image/svg+xml", ".svg"),
    ("font/woff2", ".woff2"),
    ("application/manifest+json", ".webmanifest"),
):
    mimetypes.add_type(_mime, _ext)


class _FingerprintedAssets(StaticFiles):
    """Vite puts a content hash in every /assets filename, so a name never
    changes meaning: browsers may keep these for a year without asking."""

    async def get_response(self, path, scope):
        response = await super().get_response(path, scope)
        if response.status_code == 200:
            response.headers["Cache-Control"] = "public, max-age=31536000, immutable"
        return response


_DIST = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if _DIST.is_dir():
    app.mount("/assets", _FingerprintedAssets(directory=_DIST / "assets"), name="assets")

    # index.html must NEVER be cached: a browser tab holding yesterday's HTML
    # keeps loading yesterday's JS bundle, and the demo quietly runs old code
    # (this actually happened — a feature "missing" on stage was a stale tab).
    # The hashed /assets files stay cacheable; only the entry document is not.
    _NO_STORE = {"Cache-Control": "no-store, must-revalidate"}

    @app.get("/")
    def index() -> FileResponse:
        return FileResponse(_DIST / "index.html", headers=_NO_STORE)

    @app.get("/{full_path:path}")
    def spa(full_path: str) -> FileResponse:
        candidate = _DIST / full_path
        if candidate.is_file():
            return FileResponse(candidate)
        return FileResponse(_DIST / "index.html", headers=_NO_STORE)
else:
    @app.get("/")
    def root() -> dict:
        return {
            "name": "ORCA",
            "problem_statement": "SIH26176",
            "docs": "/docs",
            "health": "/api/health",
            "note": "Frontend not built yet — run `npm install && npm run build` in frontend/.",
        }
