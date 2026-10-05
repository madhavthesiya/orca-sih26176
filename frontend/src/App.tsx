import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as api from "./api";
import AgentTracePanel from "./components/AgentTrace";
import AuthorityPanel from "./components/AuthorityPanel";
import ChatPanel from "./components/ChatPanel";
import ConditionsStrip from "./components/ConditionsStrip";
import FishingPanel from "./components/FishingPanel";
import {
  ChartDefs,
  CompassMark,
  PlayGlyph,
  SpeakerGlyph,
  SpeakerOffGlyph,
  StopGlyph,
  WarnGlyph,
} from "./components/glyphs";
import GuidedTour, { TOUR } from "./components/GuidedTour";
import Landing from "./components/Landing";
import LocationPicker, { PORTS, type PickedLocation } from "./components/LocationPicker";
import MarineMap from "./components/MarineMap";
import PFZList from "./components/PFZList";
import RiskCard from "./components/RiskCard";
import { RISK_COLOR } from "./components/RiskDial";
import SystemPanel from "./components/SystemPanel";
import { readingState, sameSpot, tripIsOff } from "./today";
import { duration, kilometres, kmh, metres } from "./units";
import ReadingStatus from "./components/ReadingStatus";
import { failKind, failureText, type FailKind } from "./failure";
import RiskTimeline from "./components/RiskTimeline";
import type {
  ChatMessage,
  ChatResponse,
  FishingOutlook,
  Language,
  Location,
  ZoneFeature,
} from "./types";

const SESSION = "demo";
const RADIUS_KM = 100;
const DEFAULT_PORT = PORTS[0]; // Mumbai — used only if location is unavailable

type AppTab = "home" | "ask" | "authority" | "system";
/** "landing" is the front door; every deep link (?tab, ?demo, ?tour, ?at) skips it. */
type Tab = AppTab | "landing";

const SCENARIOS: {
  id: string;
  n: string;
  label: Record<Language, string>;
  ask: string;
  hint: string;
}[] = [
  { id: "safe", n: "1", label: { en: "Safe", hi: "सुरक्षित", gu: "સુરક્ષિત" }, ask: "Is it safe to go fishing tomorrow morning near Goa?", hint: "Goa · LOW" },
  { id: "danger", n: "2", label: { en: "Rough", hi: "ख़राब मौसम", gu: "ખરાબ હવામાન" }, ask: "શું હું આવતીકાલે સવારે 6 વાગ્યે મુંબઈ નજીક માછીમારી કરવા જઈ શકું?", hint: "Mumbai · ગુજરાતી" },
  { id: "cyclone", n: "3", label: { en: "Cyclone", hi: "चक्रवात", gu: "વાવાઝોડું" }, ask: "Is there a cyclone near Paradip? Can I go fishing?", hint: "Paradip · EXTREME" },
  { id: "pfz", n: "4", label: { en: "Fishing zones", hi: "मत्स्य क्षेत्र", gu: "માછીમારી ક્ષેત્રો" }, ask: "कोच्चि के पास मछली पकड़ने का क्षेत्र कहाँ है?", hint: "Kochi · हिंदी" },
  { id: "route", n: "5", label: { en: "Safe route", hi: "सुरक्षित मार्ग", gu: "સુરક્ષિત માર્ગ" }, ask: "Give me the safest route to the nearest fishing zone near Mumbai", hint: "Mumbai · geofence" },
];

const TAB_LABEL: Record<Language, Record<AppTab, string>> = {
  en: { home: "Today", ask: "Ask ORCA", authority: "Authority", system: "System" },
  hi: { home: "आज", ask: "ORCA से पूछें", authority: "प्रशासन", system: "प्रणाली" },
  gu: { home: "આજે", ask: "ORCA ને પૂછો", authority: "વહીવટીતંત્ર", system: "સિસ્ટમ" },
};

/** The app chrome, in the fisher's language. */
const UI: Record<Language, Record<string, string>> = {
  en: {
    chartNo: "Chart №",
    dataEdition: "Data edition",
    voice: "Voice",
    lang: "Language",
    tour: "Guided tour",
    stopTour: "Stop tour",
    marginalia: "Soundings in metres · WGS 84",
    scenarios: "Rehearsed scenarios",
    courses: "Plotted courses",
    recommended: "Recommended",
    warnings: "Official marine warnings",
    validTill: "valid till",
  },
  hi: {
    chartNo: "चार्ट क्र.",
    dataEdition: "डेटा संस्करण",
    voice: "आवाज़",
    lang: "भाषा",
    tour: "गाइडेड टूर",
    stopTour: "टूर रोकें",
    marginalia: "गहराई मीटर में · WGS 84",
    scenarios: "तैयार परिदृश्य",
    courses: "आँके गए मार्ग",
    recommended: "सुझाया गया",
    warnings: "आधिकारिक समुद्री चेतावनियाँ",
    validTill: "मान्य",
  },
  gu: {
    chartNo: "ચાર્ટ નં.",
    dataEdition: "ડેટા આવૃત્તિ",
    voice: "અવાજ",
    lang: "ભાષા",
    tour: "ગાઇડેડ ટૂર",
    stopTour: "ટૂર બંધ કરો",
    marginalia: "ઊંડાઈ મીટરમાં · WGS 84",
    scenarios: "તૈયાર દૃશ્યો",
    courses: "આલેખેલા માર્ગો",
    recommended: "ભલામણ કરેલ",
    warnings: "સત્તાવાર સમુદ્રી ચેતવણીઓ",
    validTill: "સુધી માન્ય",
  },
};

export default function App() {
  const [tab, setTab] = useState<Tab>("landing");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latest, setLatest] = useState<ChatResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [langChoice, setLangChoice] = useState<Language | null>(null);
  const [detected, setDetected] = useState<Language>("en");
  const language = langChoice ?? detected;
  const [zones, setZones] = useState<ZoneFeature[]>([]);
  const [mode, setMode] = useState<string>("DEMO");
  const [switching, setSwitching] = useState(false);
  const [speak, setSpeak] = useState(true);
  const [error, setError] = useState<FailKind | null>(null);

  // ---- fisher's own position + outlook ----
  const [place, setPlace] = useState<PickedLocation | null>(null);
  const [outlook, setOutlook] = useState<FishingOutlook | null>(null);
  const [loadingOutlook, setLoadingOutlook] = useState(false);
  const [outlookFail, setOutlookFail] = useState<FailKind | null>(null);
  const [outlookTick, setOutlookTick] = useState(0);
  // A one-minute clock so a reading left open visibly ages into "stale".
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60_000);
    return () => window.clearInterval(id);
  }, []);
  const [focusRank, setFocusRank] = useState<number | null>(null);

  // ---- guided tour ----
  const [tourOn, setTourOn] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourPaused, setTourPaused] = useState(false);
  const tourActionDone = useRef(-1);

  // ---------------------------------------------------------------- boot
  useEffect(() => {
    api.zones().then((z) => setZones(z.features)).catch(() => setZones([]));
    api.health().then((h) => setMode(h.data_mode)).catch(() => setMode("DEMO"));

    // The app must be useful the moment it opens: find the fisher, then load
    // safety, grounds and warnings without them touching anything.
    const fallback = () =>
      setPlace({
        latitude: DEFAULT_PORT.lat,
        longitude: DEFAULT_PORT.lon,
        label: DEFAULT_PORT.name,
        source: "default",
      });

    // ?at=lat,lon pins the starting position (demos, judge-tap re-creation);
    // it must win over geolocation, so GPS is skipped entirely when present.
    const params = new URLSearchParams(window.location.search);
    const at = (params.get("at") ?? "").split(",").map(Number);
    if (at.length === 2 && at.every(Number.isFinite)) {
      setPlace({ latitude: at[0], longitude: at[1], label: "Selected point", source: "map" });
      setTab("home");
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) =>
          setPlace({
            latitude: +pos.coords.latitude.toFixed(4),
            longitude: +pos.coords.longitude.toFixed(4),
            label: "Your location",
            source: "gps",
          }),
        fallback,
        { enableHighAccuracy: true, timeout: 7000, maximumAge: 300_000 },
      );
    } else {
      fallback();
    }

    const tabParam = params.get("tab");
    if (tabParam === "home" || tabParam === "ask" || tabParam === "authority" || tabParam === "system")
      setTab(tabParam);
    const langParam = params.get("lang");
    if (langParam === "en" || langParam === "hi" || langParam === "gu") setLangChoice(langParam);
    const timers: number[] = [];
    const wanted = params.get("demo");
    if (wanted) {
      const s = SCENARIOS.find((x) => x.id === wanted || x.n === wanted);
      if (s) timers.push(window.setTimeout(() => runScenario(s.ask), 250));
    }
    if (params.get("tour") === "1") timers.push(window.setTimeout(() => startTour(), 500));
    return () => timers.forEach((id) => window.clearTimeout(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Screen readers, the crash guard and the browser's own spellings follow the reader.
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // ---------------------------------------------------- outlook on position
  useEffect(() => {
    if (!place) return;
    let alive = true;
    setLoadingOutlook(true);
    setFocusRank(null);
    api
      .fishingOutlook(place.latitude, place.longitude, {
        radiusKm: RADIUS_KM,
        days: 3,
        lang: language,
      })
      .then((d) => {
        if (!alive) return;
        setOutlook(d);
        setOutlookFail(null);
        setNow(Date.now());
      })
      .catch((e) => {
        if (!alive) return;
        setOutlookFail(failKind(e));
        // Hold a reading for this same spot (marked stale); never another spot's.
        setOutlook((prev) => (prev && sameSpot(prev.location, place) ? prev : null));
      })
      .finally(() => alive && setLoadingOutlook(false));
    return () => {
      alive = false;
    };
  }, [place?.latitude, place?.longitude, language, outlookTick]);

  const [timeOffset, setTimeOffset] = useState(0);

  // ------------------------------------------------------------- chat
  const send = async (text: string) => {
    setError(null);
    setBusy(true);
    setMessages((m) => [...m, { id: `${Date.now()}-u`, role: "user", text }]);
    
    // Safety guardrail for demos: if we are asking a new question, reset the time-machine
    // simulator so the new scenario doesn't accidentally inherit a +48h future state.
    if (timeOffset !== 0) {
      setTimeOffset(0);
      await api.setTimeOffset(0);
    }

    try {
      const res = await api.ask({
        message: text,
        language: langChoice ?? undefined,
        sessionId: SESSION,
      });
      setLatest(res);
      setDetected(res.language);
      setMode(res.mode);
      setMessages((m) => [
        ...m,
        { id: `${Date.now()}-o`, role: "orca", text: res.answer, response: res },
      ]);
      if (speak) {
        try {
          const u = new SpeechSynthesisUtterance(res.answer.split(". ").slice(0, 2).join(". "));
          u.lang = res.language === "gu" ? "gu-IN" : res.language === "hi" ? "hi-IN" : "en-IN";
          u.rate = 0.98;
          window.speechSynthesis.cancel();
          window.speechSynthesis.speak(u);
        } catch {
          /* TTS unavailable — non-fatal */
        }
      }
    } catch (e) {
      const kind = failKind(e);
      const f = failureText(kind, language);
      setError(kind);
      setMessages((m) => [...m, { id: `${Date.now()}-e`, role: "orca", text: `${f.title} ${f.hint}` }]);
    } finally {
      setBusy(false);
    }
  };

  const runScenario = async (ask: string) => {
    setTab("ask");
    await api.resetSession(SESSION).catch(() => {});
    setMessages([]);
    setLatest(null);
    setLangChoice(null);
    await send(ask);
  };

  // ------------------------------------------------------------- tour
  useEffect(() => {
    if (!tourOn || tourPaused) return;
    const s = TOUR[tourStep];
    if (!s) return;
    let cancelled = false;
    let timer = 0;

    (async () => {
      if (tourActionDone.current !== tourStep) {
        tourActionDone.current = tourStep;
        if (s.tab) setTab(s.tab as Tab);
        if (s.ask) {
          if (s.followUp) await send(s.ask);
          else await runScenario(s.ask);
        }
      }
      if (cancelled) return;
      timer = window.setTimeout(() => {
        if (cancelled) return;
        if (tourStep + 1 < TOUR.length) setTourStep(tourStep + 1);
        else setTourOn(false);
      }, s.dwell);
    })();

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourOn, tourStep, tourPaused]);

  const startTour = async () => {
    await api.resetSession(SESSION).catch(() => {});
    setMessages([]);
    setLatest(null);
    setLangChoice(null);
    setTab("home");
    tourActionDone.current = -1;
    setTourStep(0);
    setTourPaused(false);
    setTourOn(true);
  };

  const gotoStep = (n: number) => {
    tourActionDone.current = -1;
    setTourStep(Math.max(0, Math.min(TOUR.length - 1, n)));
  };

  const toggleMode = async () => {
    const next = mode === "LIVE" ? "DEMO" : "LIVE";
    setSwitching(true);
    try {
      const r = await api.setMode(next);
      setMode(r.data_mode);
      if (place) setPlace({ ...place }); // re-fetch the outlook under the new mode
    } catch {
      /* keep current mode */
    } finally {
      setSwitching(false);
    }
  };

  const handleTimeOffset = async (hours: number) => {
    setTimeOffset(hours);
    await api.setTimeOffset(hours);
    if (tab === "home" && place) {
      setPlace({ ...place });
    } else if (tab === "ask" && messages.length > 0) {
      const last = messages.filter(m => m.role === "user").pop();
      if (last) {
        runScenario(last.text);
      }
    }
  };

  const pickLocation = useCallback((lat: number, lon: number) => {
    setPlace({ latitude: lat, longitude: lon, label: "Selected point", source: "map" });
  }, []);

  const suggestions = useMemo(() => latest?.suggestions ?? [], [latest]);
  const tabLabels = TAB_LABEL[language] ?? TAB_LABEL.en;
  const ui = UI[language] ?? UI.en;

  const homeOrigin: Location | null = place
    ? {
        name: outlook?.location.name ?? place.label,
        latitude: place.latitude,
        longitude: place.longitude,
        state: outlook?.location.state ?? null,
      }
    : null;

  if (tab === "landing") {
    return (
      <>
        <ChartDefs />
        <Landing
          mode={mode}
          language={language}
          onLanguage={setLangChoice}
          onEnter={setTab}
          onTour={startTour}
          onScenario={runScenario}
        />
      </>
    );
  }

  return (
    <div className="flex min-h-full flex-col lg:flex-row">
      <ChartDefs />

      {/* ---------------- navigation rail: identity, destinations, controls ---------------- */}
      <aside className="rail">
        {/* identity — clicking it returns to the front page */}
        <button
          onClick={() => setTab("landing")}
          title="Back to the front page"
          className="flex items-center gap-3 rounded-[10px] text-left lg:px-2"
        >
          <CompassMark size={34} className="shrink-0 text-flag" />
          <span>
            <span className="block font-display text-[34px] font-black leading-none text-paper-50">ORCA</span>
            <span className="mt-1 hidden text-[11.5px] leading-snug text-ink-300 lg:block">
              Marine ecosystem reasoning with collaborative agents
            </span>
          </span>
        </button>

        <nav className="flex gap-1 lg:mt-8 lg:flex-col">
          {(["home", "ask", "authority", "system"] as AppTab[]).map((x) => (
            <button
              key={x}
              onClick={() => setTab(x)}
              aria-current={tab === x ? "page" : undefined}
              className={`rail-tab ${tab === x ? "rail-tab-on" : ""}`}
            >
              {tabLabels[x]}
            </button>
          ))}
        </nav>

        <div className="ml-auto flex flex-wrap items-center gap-2 lg:ml-0 lg:mt-auto lg:flex-col lg:items-stretch lg:gap-4">
          <div className="flex items-center gap-2 lg:justify-between">
            <span className="rail-label">{ui.dataEdition}</span>
            <button
              onClick={toggleMode}
              disabled={switching}
              title="Switch between cached demo data and live public providers"
              className="rail-toggle disabled:opacity-50"
            >
              <span className={`h-2 w-2 rounded-full ${mode === "LIVE" ? "bg-risk-low" : "bg-flag"}`} />
              {switching ? "…" : mode}
            </button>
          </div>

          <div className="flex items-center gap-2 lg:justify-between">
            <span className="rail-label">{ui.voice}</span>
            <button onClick={() => setSpeak((v) => !v)} title="Speak answers aloud" className="rail-toggle">
              {speak ? <SpeakerGlyph /> : <SpeakerOffGlyph className="text-ink-300" />}
              {speak ? "On" : "Off"}
            </button>
          </div>

          <div className="flex items-center gap-2 lg:justify-between">
            <span className="rail-label">{ui.lang}</span>
            <span className="flex gap-1">
              {(["en", "hi", "gu"] as Language[]).map((l) => (
                <button
                  key={l}
                  onClick={() => setLangChoice(l)}
                  className={`rounded-[7px] px-2 py-1 text-[12.5px] font-bold transition ${
                    language === l ? "bg-flag text-ink-900" : "text-ink-300 hover:text-paper-50"
                  }`}
                >
                  {l === "en" ? "EN" : l === "hi" ? "हिं" : "ગુજ"}
                </button>
              ))}
            </span>
          </div>

          <button onClick={() => (tourOn ? setTourOn(false) : startTour())} className="btn-ink justify-center">
            {tourOn ? <StopGlyph size={11} /> : <PlayGlyph size={11} />}
            {tourOn ? ui.stopTour : ui.tour}
          </button>

          <p className="hidden text-[11px] leading-snug text-ink-300 lg:block">
            {ui.chartNo} SIH26176 · {ui.marginalia}
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 lg:p-6">
        {tourOn && (
          <GuidedTour
            step={tourStep}
            language={language}
            paused={tourPaused}
            onPause={() => setTourPaused((p) => !p)}
            onNext={() => gotoStep(tourStep + 1)}
            onPrev={() => gotoStep(tourStep - 1)}
            onExit={() => setTourOn(false)}
          />
        )}

        {error && (
          <div
            role="alert"
            className="panel hatch-danger flex flex-wrap items-center gap-x-3 gap-y-1 border-signal/60 px-4 py-2.5 text-[13.5px]"
          >
            <WarnGlyph size={15} className="shrink-0 text-risk-extreme" />
            <span className="font-bold text-risk-extreme">{failureText(error, language).title}</span>
            <span className="text-ink-700">{failureText(error, language).hint}</span>
            <button onClick={() => setError(null)} className="ml-auto text-[13px] font-bold text-chart-600 underline underline-offset-4">
              {language === "gu" ? "બંધ કરો" : language === "hi" ? "बंद करें" : "Dismiss"}
            </button>
          </div>
        )}

        {/* ================= HOME : location + today's plan ================= */}
        {tab === "home" && (
          <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.35fr_minmax(370px,1fr)]">
            <div className="space-y-4">
              <LocationPicker current={place} language={language} onPick={setPlace} />

              <MarineMap
                origin={homeOrigin}
                zones={zones}
                pfz={[]}
                areas={outlook && !tripIsOff(outlook) ? outlook.areas : []}
                radiusKm={outlook?.radius_km ?? RADIUS_KM}
                routes={outlook && !tripIsOff(outlook) ? outlook.routes : []}
                geofence={[]}
                language={language}
                onPickLocation={pickLocation}
                focusRank={focusRank}
                onTimeOffset={handleTimeOffset}
                timeOffset={timeOffset}
              />

              {outlook && (
                <div className="grid grid-cols-2 overflow-hidden rounded-[14px] bg-ink-900 sm:grid-cols-4">
                  {[
                    {
                      k: language === "gu" ? "સુરક્ષા" : language === "hi" ? "सुरक्षा" : "Safety",
                      v: `${outlook.safety.score}`,
                      s: outlook.safety.category,
                      color: RISK_COLOR[outlook.safety.category],
                    },
                    {
                      k: language === "gu" ? "મોજાં" : language === "hi" ? "लहरें" : "Waves",
                      v: metres(outlook.safety.wave_height_m),
                      s: "m",
                    },
                    {
                      k: language === "gu" ? "પવન" : language === "hi" ? "हवा" : "Wind",
                      v: kmh(outlook.safety.wind_speed_kmh),
                      s: "km/h",
                    },
                    {
                      k: language === "gu" ? "વિસ્તારો" : language === "hi" ? "जगहें" : "Areas",
                      v: `${outlook.areas.length}`,
                      s: `in ${outlook.radius_km} km`,
                    },
                  ].map((x, i) => (
                    <div
                      key={x.k}
                      className={`px-5 py-3.5 ${i > 0 ? "border-l border-paper-50/10" : ""}`}
                    >
                      <div className="flex items-center gap-2 truncate text-[12.5px] font-bold text-ink-300">
                        {x.color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: x.color }} />}
                        {x.k}
                      </div>
                      <div className="mt-1 font-display text-[34px] font-extrabold tabular-nums leading-none text-paper-50">
                        {x.v}
                        <span className="ml-1.5 font-sans text-[13px] font-bold text-ink-300">{x.s}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 lg:h-[calc(100vh-48px)] lg:overflow-y-auto lg:pr-1">
              <ReadingStatus
                state={readingState({
                  hasData: !!outlook,
                  loading: loadingOutlook,
                  failed: !!outlookFail,
                  generatedAt: outlook?.generated_at,
                  now,
                })}
                failed={!!outlookFail}
                failure={outlookFail}
                generatedAt={outlook?.generated_at ?? null}
                language={language}
                now={now}
                onRefresh={() => setOutlookTick((n) => n + 1)}
              />
              {loadingOutlook && !outlook && (
                <div className="panel p-6 text-center text-sm italic text-ink-400">
                  {language === "gu"
                    ? "તમારા સ્થાનની માહિતી લેવાઈ રહી છે…"
                    : language === "hi"
                      ? "आपके स्थान की जानकारी ले रहे हैं…"
                      : "Reading the sea at your location…"}
                </div>
              )}
              {outlook && (
                <FishingPanel
                  data={outlook}
                  language={language}
                  onSelectArea={(rank) => setFocusRank(rank)}
                />
              )}
            </div>
          </div>
        )}

        {/* ================= ASK : the conversational view ================= */}
        {tab === "ask" && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label mr-1">{ui.scenarios}</span>
              {SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => runScenario(s.ask)}
                  disabled={busy}
                  title={s.ask}
                  className="chip disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <span className="grid w-[18px] shrink-0 place-items-center rounded-full bg-ink-900 font-display text-[12px] font-bold leading-none text-paper-50" style={{ height: 18 }}>
                    {s.n}
                  </span>
                  <span className="font-semibold">{s.label[language] ?? s.label.en}</span>
                  <span className="text-[12px] opacity-60 font-bold">{s.hint}</span>
                </button>
              ))}
            </div>

            <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(350px,1fr)_1.6fr]">
              <div className="min-h-[540px] lg:h-[calc(100vh-112px)]">
                <ChatPanel
                  messages={messages}
                  busy={busy}
                  language={language}
                  suggestions={suggestions}
                  onSend={send}
                  onLanguage={setLangChoice}
                />
              </div>

              <div className="space-y-4 lg:h-[calc(100vh-112px)] lg:overflow-y-auto lg:pr-1">
                {latest && <ConditionsStrip res={latest} language={latest.language} />}

                <MarineMap
                  origin={latest?.intent.location ?? null}
                  zones={zones}
                  pfz={latest?.pfz ?? []}
                  routes={latest?.routes ?? []}
                  geofence={latest?.geofence ?? []}
                  alerts={latest?.alerts ?? []}
                  language={language}
                  onTimeOffset={handleTimeOffset}
                  timeOffset={timeOffset}
                />

                {latest?.risk && (
                  <RiskCard
                    risk={latest.risk}
                    evidence={latest.evidence}
                    language={latest.language}
                  />
                )}

                {latest && (
                  <RiskTimeline location={latest.intent.location} language={latest.language} />
                )}

                {latest && latest.alerts.length > 0 && (
                  <div className="panel hatch-danger overflow-hidden border-risk-extreme/60">
                    <div className="hd border-risk-extreme/25">
                      <span className="label flex items-center gap-2 !text-risk-extreme">
                        <WarnGlyph size={13} /> {ui.warnings}
                      </span>
                    </div>
                    <div className="px-4 py-3.5">
                      {latest.alerts.map((a, i) => (
                        <div key={i} className="mb-3 last:mb-0">
                          <div className="font-display text-[15px] font-bold leading-snug text-risk-extreme">
                            {a.headline}
                          </div>
                          <div className="mt-1 text-[12px] leading-relaxed text-ink-700">
                            {a.detail}
                          </div>
                          <div className="mt-1 text-[12px] text-ink-400 font-bold">
                            {a.source} · {a.severity}
                            {a.valid_till ? ` · ${ui.validTill} ${a.valid_till}` : ""}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {latest && <PFZList zones={latest.pfz} language={latest.language} />}

                {latest && latest.routes.length > 0 && (
                  <div className="panel overflow-hidden">
                    <div className="hd">
                      <span className="label">{ui.courses}</span>
                    </div>
                    <div className="space-y-2 px-4 py-3.5">
                      {latest.routes.map((r) => (
                        <div
                          key={r.name}
                          className={`rounded-[6px] border px-3.5 py-3 ${
                            r.recommended ? "border-risk-low/70 bg-risk-low/[0.06]" : "bg-paper-100"
                          }`}
                          style={r.recommended ? undefined : { borderColor: "var(--rule)" }}
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="flex items-center gap-2.5 font-display text-[14.5px] font-bold text-ink-900">
                              {/* course symbology, drawn as plotted */}
                              <svg width="26" height="8" aria-hidden>
                                <line
                                  x1="1"
                                  y1="4"
                                  x2="25"
                                  y2="4"
                                  stroke={r.recommended ? "#0F8A5C" : "#5C7189"}
                                  strokeWidth="2"
                                  strokeDasharray={r.recommended ? "7 4" : "2 4"}
                                />
                              </svg>
                              {r.name}
                              {r.recommended && (
                                <span className="stamp !px-1.5 !py-0.5 !text-[11.5px] text-risk-low">
                                  {ui.recommended}
                                </span>
                              )}
                            </span>
                            <span className="shrink-0 font-mono text-[11.5px] tabular-nums text-ink-500">
                              {kilometres(r.distance_km)} km · {duration(r.eta_minutes)}
                            </span>
                          </div>
                          <div className="mt-1 pl-[36px] text-[11.5px] leading-relaxed text-ink-500">
                            {r.notes}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {latest && (
                  <AgentTracePanel trace={latest.trace} elapsed={latest.elapsed_ms} language={latest.language} />
                )}

                {latest && (
                  <p className="px-1 pb-2 font-mono text-[12px] leading-relaxed text-ink-400">
                    {latest.disclaimer}
                  </p>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "authority" && <AuthorityPanel language={language} />}

        {tab === "system" && <SystemPanel mode={mode} language={language} />}
      </main>
    </div>
  );
}
