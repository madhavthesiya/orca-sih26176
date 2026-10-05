# ORCA — Ocean Risk & Collaborative Agents

**Team ID 138259 · SagarMitra · SIH 2026 · Problem Statement PS-26176**  
*Space Technology Theme · Software Category — Marine Fishermen Safety*

🔗 **Live Demo:** [orca-marine-six.vercel.app](https://orca-marine-six.vercel.app/) &nbsp;|&nbsp; 🎥 **Video Demo:** [YouTube (4 min)](https://youtu.be/lbz6ioSUom4) &nbsp;|&nbsp; 📂 **GitHub:** [madhavthesiya/orca-sih26176](https://github.com/madhavthesiya/orca-sih26176)

---

## What is ORCA?

ORCA is a real-time marine ecosystem safety platform for Indian coastal fishermen. It uses a **10-agent AI pipeline** to assess sea conditions, detect hazards, and deliver go/no-go safety decisions in English, Hindi, and Gujarati — including voice output.

> 📺 **Watch the Demo Video:** **https://youtu.be/lbz6ioSUom4**  
> 🌐 **Try the Live App:** **https://orca-marine-six.vercel.app/**  
> 
> **Run locally (no API key, no internet needed):**
> ```
> RUN-ORCA.bat
> ```
> Then open `http://localhost:5173`

---

## Key Features

| Feature | Description |
|---------|-------------|
| **10-Agent Pipeline** | Intent → Weather → Ocean → Cyclone → GIS → Risk → PFZ → Route → Explanation → Planner |
| **Trilingual** | English · Hindi · Gujarati — auto-detected, full voice output |
| **Abstention Guardrail** | Engine refuses to score when data is missing — never hallucinates a false "safe" verdict |
| **Time-Machine Simulator** | Drag a slider to simulate +1h to +48h future conditions. Cyclone moves along its real track. |
| **SMS Fallback** | Authority panel generates a ≤160-char SMS payload for offline broadcast to vessels |
| **Offline-First** | Runs fully without internet. Demo mode uses deterministic cached data — stage Wi-Fi cannot kill it. |
| **Live Cyclone Map** | Storm geometry (warning radius + forecast track) drawn directly on the maritime chart |
| **Transparent AI** | Every agent's latency, confidence, and reasoning visible in the Agent Trace panel |

---

## Demo Scenarios (built-in, no setup needed)

| Scenario | Location | Risk | Story |
|----------|----------|------|-------|
| **Safe** | Panaji (Goa) | LOW 9/100 | Calm seas, 3 ranked PFZ fishing zones shown |
| **Rough** | Mumbai | HIGH 70/100 | Rough morning, IMD warning, clears after 11:00 |
| **EXTREME** | Paradip | EXTREME 92/100 | Severe cyclone, storm drawn on chart, track visible |
| **Abstention** | *ask "near Offline"* | UNKNOWN | Sensor blackout — engine refuses to score safely |

### The Killer Demo Query (from our SIH PDF)
```
શું આવતીકાળે સવારે દરિયામાં જવું સુરક્ષિત છે?
```
*Type or speak this in the chat — ORCA detects Gujarati, parses "tomorrow morning", queries the full pipeline, and answers in Gujarati with voice.*

---

## Architecture

```
Browser (http://localhost:5173)
  React 18 + TypeScript + Tailwind + Vite
  Leaflet (Esri Ocean basemap) · Multilingual TTS · Guided Tour
        │
        ▼  REST/JSON
FastAPI backend (http://127.0.0.1:8000)
        │
        ├─ Intent Agent      → language + location + time
        ├─ Weather Agent     → wind / rain / lightning / visibility
        ├─ Ocean Agent       → wave height / sea state / SST
        ├─ Cyclone Agent     → IMD-style warnings + storm geometry
        ├─ GIS Agent         → geofencing / restricted zones / shore distance
        ├─ Risk Engine       → weighted score (0–100) + deterministic overrides
        ├─ PFZ Agent         → SST/chlorophyll fronts → ranked fishing zones
        ├─ Route Agent       → safest vs shortest route options
        ├─ Explanation Agent → multilingual answer generation
        └─ Planner Agent     → orchestrates all above (concurrent execution)

Data:   DEMO mode (default) → deterministic keyframe interpolation, no internet
        LIVE mode → Open-Meteo Marine API → auto-fallback to DEMO on failure
```

---

## Quick Start

### Requirements
- Python 3.10+
- Node.js 18+

### One-click (Windows)
```
RUN-ORCA.bat
```

### Manual
```bash
# Terminal 1 — Backend
cd backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 — Frontend
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

---

## API Keys

**None required for demo.**

| Service | Key needed? | Notes |
|---------|-------------|-------|
| Open-Meteo | ❌ No | Free marine weather API, used in LIVE mode only |
| OpenStreetMap / Esri | ❌ No | Free tile providers |
| Anthropic Claude | Optional | Only for LLM answer rephrasing. App works fully without it. |

To optionally enable LLM rephrasing:
```powershell
$env:ANTHROPIC_API_KEY = "sk-ant-..."
```

---

## Safety Design Principles

1. **Deterministic overrides win** — no model output or LLM can override an official IMD/INCOIS warning
2. **Lightning is always HIGH** — a score floor of 65 is enforced regardless of sea state
3. **Abstention over hallucination** — if wave AND wind data are both missing, the engine returns `UNKNOWN` and refuses to calculate
4. **Offline-first** — the app degrades gracefully from LIVE → DEMO, never crashes

---

## Team

**Team ID 138259 — SagarMitra**  
SIH 2026 · PS-26176 · Space Technology Theme · Software Category

---

## Disclaimer

All demo data is **synthetic and clearly labelled** as such (`DEMO` tag on every data point). This is not a substitute for official IMD / INCOIS / Coast Guard advisories. For production use, integrate with authoritative live data feeds.
