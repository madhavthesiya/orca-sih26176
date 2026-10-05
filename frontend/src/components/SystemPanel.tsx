import { useEffect, useRef, useState } from "react";
import * as api from "../api";
import type { Language, RiskCategory } from "../types";
import { CourseArrow, FishGlyph, LockGlyph } from "./glyphs";
import { PORTS } from "./LocationPicker";
import { RISK_COLOR } from "./RiskDial";

/** The engine room, in the fisher's three languages. */
const L10N: Record<Language, Record<string, string>> = {
  en: {
    engineRoom: "The engine room",
    configNote: "GET /api/config exposes every weight and threshold — nothing is hidden",
    title: "What we do with the data",
    intro:
      "One question triggers one sweep of the machine below: live providers are read once per position, remembered as a 72-hour series, reasoned over by ten agents in parallel, floored by deterministic safety rules — and every number that reaches the screen carries its source, timestamp and mode.",
    s1: "01 · Intake — what comes in",
    s2: "02 · Reasoning — who touches it",
    s2note: "ThreadPoolExecutor fan-out · real latencies in the Agent crew panel",
    s3: "03 · The law — floors that only raise",
    s4: "04 · Out — what it becomes",
    oneFetch: "one HTTP fetch",
    perProvider: "per provider · per position",
    cacheTitle: "The series cache",
    cacheBody:
      "One response already holds 72 hours of hourly sea for that spot. We keep it — keyed to the kilometre, for ten minutes — so the 24-hour timeline, the safe-window scan and the authority board all answer from memory instead of hammering the provider.",
    cacheMeta: "failures remembered 60 s · cleared on mode toggle · 32 s → 0.02 s",
    everyAgent: "every agent · every hour",
    fromMemory: "answered from memory",
    degrade:
      "If a live provider fails, the agent degrades to the demo store and says so — the answer arrives either way, relabelled, never silently pretending to be live.",
    stamp: "Official severe warning → 92",
    law1: "IMD fishermen warning active → floor 70",
    law2: "wave ≥ 4.0 m → floor 85 · gale wind ≥ 62 km/h → floor 85",
    law3: "inside a restricted zone → floor 60",
    lawNote:
      "Deterministic rules can only raise a score. No model, no language output, no prompt can talk ORCA down from an official warning.",
    reading: "Reading the coast — right now",
    onePort: "one port every",
    flipNote: "edition · flip DATA EDITION in the header and watch the sources change",
    nowReading: "Now reading",
    wave: "Wave",
    wind: "Wind",
    sst: "Sea temp",
    vis: "Visibility",
    hailing: "Hailing the first landing centre…",
    unreachable: "Backend unreachable — is uvicorn running on port 8000?",
    hPort: "Port",
    hSource: "Source",
    hMode: "Mode",
    hLatency: "Latency",
    hAt: "At",
    feedNote:
      "These are the same readings the fishing model and the risk engine consume — wave and wind feed the safety score, SST and chlorophyll feed the chance-of-fish, and the provenance column is what the evidence table shows a fisher.",
    outVerdict: "A verdict",
    outVerdictD:
      "0–100 risk with every point attributed, floored by the safety law, spoken in the fisher's language.",
    outPlan: "A plan",
    outPlanD:
      "Ranked grounds with chance of fish and likely species, the best window, how long to stay, the safest course.",
    outLedger: "A ledger",
    outLedgerD:
      "Every value with source · timestamp · confidence · mode. Simulated data is always labelled. CSV export for the authority.",
  },
  hi: {
    engineRoom: "इंजन रूम",
    configNote: "GET /api/config हर वेट और सीमा दिखाता है — कुछ भी छिपा नहीं",
    title: "डेटा का हम क्या करते हैं",
    intro:
      "एक सवाल नीचे की पूरी मशीन चलाता है: लाइव स्रोत हर स्थान के लिए एक बार पढ़े जाते हैं, 72 घंटे की सीरीज़ के रूप में याद रहते हैं, दस एजेंट एक साथ उन पर तर्क करते हैं, निश्चित सुरक्षा नियम लागू होते हैं — और स्क्रीन तक पहुँचने वाले हर आँकड़े के साथ उसका स्रोत, समय और मोड होता है।",
    s1: "01 · आगम — क्या आता है",
    s2: "02 · तर्क — कौन छूता है",
    s2note: "ThreadPoolExecutor फैन-आउट · असली लेटेंसी एजेंट पैनल में",
    s3: "03 · नियम — जो सिर्फ़ जोखिम बढ़ाते हैं",
    s4: "04 · परिणाम — क्या बनता है",
    oneFetch: "एक HTTP कॉल",
    perProvider: "प्रति स्रोत · प्रति स्थान",
    cacheTitle: "सीरीज़ कैश",
    cacheBody:
      "एक जवाब में उस जगह के 72 घंटे का प्रति-घंटा समुद्र होता है। हम उसे रखते हैं — किलोमीटर पर, दस मिनट के लिए — ताकि 24 घंटे की टाइमलाइन, सुरक्षित-समय की जाँच और प्रशासन बोर्ड सब स्मृति से जवाब दें, स्रोत को बार-बार न पुकारें।",
    cacheMeta: "विफलता 60 सेकंड याद · मोड बदलने पर साफ़ · 32 s → 0.02 s",
    everyAgent: "हर एजेंट · हर घंटा",
    fromMemory: "स्मृति से जवाब",
    degrade:
      "लाइव स्रोत विफल हो तो एजेंट डेमो डेटा पर उतर आता है और यह बताता भी है — जवाब हर हाल में आता है, सही लेबल के साथ, कभी चुपचाप लाइव होने का दिखावा नहीं।",
    stamp: "आधिकारिक भीषण चेतावनी → 92",
    law1: "IMD मछुआरा चेतावनी सक्रिय → कम-से-कम 70",
    law2: "लहर ≥ 4.0 मी → 85 · आँधी हवा ≥ 62 किमी/घं → 85",
    law3: "प्रतिबंधित क्षेत्र के भीतर → 60",
    lawNote:
      "निश्चित नियम स्कोर सिर्फ़ बढ़ा सकते हैं। कोई मॉडल, कोई भाषा, कोई प्रॉम्प्ट ORCA को आधिकारिक चेतावनी से नीचे नहीं ला सकता।",
    reading: "तट की रीडिंग — अभी",
    onePort: "हर",
    flipNote: "संस्करण · हेडर में DATA EDITION बदलिए और स्रोत बदलते देखिए",
    nowReading: "अभी पढ़ रहे हैं",
    wave: "लहर",
    wind: "हवा",
    sst: "समुद्री तापमान",
    vis: "दृश्यता",
    hailing: "पहले लैंडिंग सेंटर से संपर्क…",
    unreachable: "बैकएंड नहीं मिला — क्या uvicorn पोर्ट 8000 पर चल रहा है?",
    hPort: "बंदरगाह",
    hSource: "स्रोत",
    hMode: "मोड",
    hLatency: "लेटेंसी",
    hAt: "समय",
    feedNote:
      "यही रीडिंग मत्स्य मॉडल और रिस्क इंजन खाते हैं — लहर-हवा सुरक्षा स्कोर में, तापमान-क्लोरोफिल मछली की संभावना में, और स्रोत वाला कॉलम वही है जो मछुआरे को प्रमाण तालिका में दिखता है।",
    outVerdict: "फ़ैसला",
    outVerdictD:
      "0–100 जोखिम, हर अंक के हिसाब के साथ, सुरक्षा नियमों से बँधा, मछुआरे की भाषा में बोला हुआ।",
    outPlan: "योजना",
    outPlanD:
      "रैंक की हुई जगहें, मछली की संभावना और संभावित प्रजातियाँ, सबसे अच्छा समय, कितना रुकना, सबसे सुरक्षित मार्ग।",
    outLedger: "बहीखाता",
    outLedgerD:
      "हर मान के साथ स्रोत · समय · भरोसा · मोड। नक़ली डेटा पर हमेशा लेबल। प्रशासन के लिए CSV निर्यात।",
  },
  gu: {
    engineRoom: "એન્જિન રૂમ",
    configNote: "GET /api/config દરેક વજન અને મર્યાદા દર્શાવે છે — કંઈપણ છુપાવેલું નથી",
    title: "અમે ડેટા સાથે શું કરીએ છીએ",
    intro:
      "એક પ્રશ્ન નીચેની આખી સિસ્ટમ ચલાવે છે: લાઇવ સ્રોતો દરેક સ્થાન માટે માત્ર એક જ વાર વંચાય છે, 72 કલાકની શ્રેણી તરીકે યાદ રહે છે, દસ એજન્ટ એકસાથે તેના પર તર્ક કરે છે, કડક સુરક્ષા નિયમો લાગુ પડે છે — અને સ્ક્રીન પર પહોંચતા દરેક આંકડા સાથે તેનો સ્રોત, સમય અને મોડ હોય છે.",
    s1: "01 · આવક — શું આવે છે",
    s2: "02 · તર્ક — કોણ સંભાળે છે",
    s2note: "ThreadPoolExecutor ફેન-આઉટ · સાચી લેટન્સી એજન્ટ પેનલમાં",
    s3: "03 · નિયમો — જે માત્ર જોખમ વધારે છે",
    s4: "04 · પરિણામ — શું બને છે",
    oneFetch: "એક HTTP કૉલ",
    perProvider: "પ્રતિ સ્રોત · પ્રતિ સ્થાન",
    cacheTitle: "શ્રેણી કેશે",
    cacheBody:
      "એક જવાબમાં તે જગ્યાનો 72 કલાકનો કલાકદીઠ સમુદ્ર હોય છે. અમે તેને સાચવીએ છીએ — કિલોમીટર પર, દસ મિનિટ માટે — એટલે 24 કલાકની સમયરેખા, સુરક્ષિત-સમયની તપાસ અને વહીવટી પેનલ બધું મેમરીમાંથી જવાબ આપે છે, સ્રોતને વારંવાર બોલાવતા નથી.",
    cacheMeta: "નિષ્ફળતા 60 સેકન્ડ યાદ · મોડ બદલાય ત્યારે સાફ · 32 s → 0.02 s",
    everyAgent: "દરેક એજન્ટ · દરેક કલાક",
    fromMemory: "મેમરીમાંથી જવાબ",
    degrade:
      "લાઇવ સ્રોત નિષ્ફળ જાય તો એજન્ટ ડેમો ડેટા પર ઉતરે છે અને તેમ જણાવે પણ છે — જવાબ કોઈપણ સંજોગોમાં આવે છે, યોગ્ય લેબલ સાથે, લાઇવ હોવાનો ડોળ ક્યારેય કરતો નથી.",
    stamp: "સત્તાવાર આકરી ચેતવણી → 92",
    law1: "IMD માછીમાર ચેતવણી સક્રિય → ઓછામાં ઓછા 70",
    law2: "મોજાં ≥ 4.0 મી → 85 · તોફાની પવન ≥ 62 કિમી/કલાક → 85",
    law3: "પ્રતિબંધિત ક્ષેત્રમાં → 60",
    lawNote:
      "કડક નિયમો માત્ર જોખમ વધારી શકે છે. કોઈ પણ મોડેલ, કોઈ પણ ભાષા, કોઈ પણ પ્રોમ્પ્ટ ORCA ને સત્તાવાર ચેતવણીથી નીચે લાવી શકતું નથી.",
    reading: "કિનારાનું વાંચન — અત્યારે",
    onePort: "દર",
    flipNote: "આવૃત્તિ · હેડરમાં DATA EDITION બદલો અને સ્રોત બદલાતા જુઓ",
    nowReading: "અત્યારે વાંચી રહ્યા છીએ",
    wave: "મોજાં",
    wind: "પવન",
    sst: "સમુદ્ર તાપમાન",
    vis: "દૃશ્યતા",
    hailing: "પહેલા લેન્ડિંગ સેન્ટરનો સંપર્ક…",
    unreachable: "બેકએન્ડ મળ્યું નહીં — uvicorn પોર્ટ 8000 પર ચાલુ છે?",
    hPort: "બંદર",
    hSource: "સ્રોત",
    hMode: "મોડ",
    hLatency: "લેટન્સી",
    hAt: "સમય",
    feedNote:
      "આ જ વાંચન માછીમારી મોડેલ અને રિસ્ક એન્જિન વાપરે છે — મોજાં-પવન સુરક્ષા ગુણોમાં, તાપમાન-ક્લોરોફિલ માછલીની શક્યતામાં, અને સ્રોતનો સ્તંભ એ જ જે માછીમારને પુરાવા કોષ્ટકમાં દેખાય છે.",
    outVerdict: "નિર્ણય",
    outVerdictD:
      "0–100 જોખમ, દરેક ગુણના હિસાબ સાથે, સુરક્ષા નિયમોથી બંધાયેલું, માછીમારની ભાષામાં બોલાયેલું.",
    outPlan: "યોજના",
    outPlanD:
      "ક્રમવાર સ્થાનો, માછલીની શક્યતા અને સંભવિત પ્રજાતિઓ, શ્રેષ્ઠ સમય, કેટલું રોકાવું, સૌથી સુરક્ષિત માર્ગ.",
    outLedger: "નોંધવહી",
    outLedgerD:
      "દરેક મૂલ્ય સાથે સ્રોત · સમય · વિશ્વાસ · મોડ. નકલી ડેટા પર હંમેશા લેબલ. વહીવટીતંત્ર માટે CSV નિકાસ.",
  },
};

/** Stage names, the law ladder and the weights — the parts the redesign adds. */
const X: Record<
  Language,
  {
    stages: { title: string; sub: string }[];
    memoryCaption: string;
    floorsCaption: string;
    floors: Record<"severe" | "waveWind" | "fishermen" | "lightning" | "zone", string>;
    weightsTitle: string;
    weights: Record<string, string>;
    lands: string;
    configLink: string;
  }
> = {
  en: {
    stages: [
      { title: "Intake", sub: "what comes in" },
      { title: "Memory", sub: "read once, answered many times" },
      { title: "Crew", sub: "who reasons over it" },
      { title: "The law", sub: "floors that only raise" },
      { title: "Out", sub: "what it becomes" },
    ],
    memoryCaption: "the first answer for a spot, then every answer after it",
    floorsCaption: "The lowest score each hazard forces, on the 0–100 risk scale",
    floors: {
      severe: "Official severe warning",
      waveWind: "Waves ≥ {m} m or wind ≥ {k} km/h",
      fishermen: "IMD fishermen warning",
      lightning: "Lightning",
      zone: "Inside a restricted zone",
    },
    weightsTitle: "How the risk engine weighs a reading, before any floor",
    weights: {
      wave: "Waves", cyclone: "Official warnings", wind: "Wind",
      weather: "Rain & visibility", ocean: "Sea state & current", gis: "Position & zones",
    },
    lands: "lands in",
    configLink: "Open the live config",
  },
  hi: {
    stages: [
      { title: "आगम", sub: "क्या आता है" },
      { title: "स्मृति", sub: "एक बार पढ़ो, कई बार जवाब" },
      { title: "टीम", sub: "कौन तर्क करता है" },
      { title: "नियम", sub: "जो सिर्फ़ जोखिम बढ़ाते हैं" },
      { title: "परिणाम", sub: "क्या बनता है" },
    ],
    memoryCaption: "किसी जगह का पहला जवाब, फिर उसके बाद का हर जवाब",
    floorsCaption: "हर ख़तरा 0–100 जोखिम पैमाने पर कम-से-कम कितना स्कोर तय करता है",
    floors: {
      severe: "आधिकारिक भीषण चेतावनी",
      waveWind: "लहर ≥ {m} मी या हवा ≥ {k} किमी/घं",
      fishermen: "IMD मछुआरा चेतावनी",
      lightning: "बिजली",
      zone: "प्रतिबंधित क्षेत्र के भीतर",
    },
    weightsTitle: "किसी भी नियम से पहले, रिस्क इंजन हर जानकारी को कितना वज़न देता है",
    weights: {
      wave: "लहरें", cyclone: "आधिकारिक चेतावनियाँ", wind: "हवा",
      weather: "बारिश और दृश्यता", ocean: "समुद्र और धारा", gis: "स्थान और क्षेत्र",
    },
    lands: "श्रेणी",
    configLink: "लाइव कॉन्फ़िग खोलें",
  },
  gu: {
    stages: [
      { title: "આવક", sub: "શું આવે છે" },
      { title: "મેમરી", sub: "એક વાર વાંચો, ઘણી વાર જવાબ" },
      { title: "ટીમ", sub: "કોણ તર્ક કરે છે" },
      { title: "નિયમો", sub: "જે માત્ર જોખમ વધારે છે" },
      { title: "પરિણામ", sub: "શું બને છે" },
    ],
    memoryCaption: "કોઈ જગ્યાનો પહેલો જવાબ, પછી તે પછીનો દરેક જવાબ",
    floorsCaption: "દરેક જોખમ 0–100 ના પાયા પર ઓછામાં ઓછો કેટલો સ્કોર નક્કી કરે છે",
    floors: {
      severe: "સત્તાવાર આકરી ચેતવણી",
      waveWind: "મોજાં ≥ {m} મી અથવા પવન ≥ {k} કિમી/કલાક",
      fishermen: "IMD માછીમાર ચેતવણી",
      lightning: "વીજળી",
      zone: "પ્રતિબંધિત ક્ષેત્રમાં",
    },
    weightsTitle: "કોઈપણ નિયમ પહેલાં, રિસ્ક એન્જિન દરેક માહિતીને કેટલું વજન આપે છે",
    weights: {
      wave: "મોજાં", cyclone: "સત્તાવાર ચેતવણીઓ", wind: "પવન",
      weather: "વરસાદ અને દૃશ્યતા", ocean: "સમુદ્ર અને પ્રવાહ", gis: "સ્થાન અને ઝોન",
    },
    lands: "શ્રેણી",
    configLink: "લાઇવ કોન્ફિગ ખોલો",
  },
};

/**
 * The engine room, read top to bottom as the pipeline actually runs.
 *
 * It opens on the machine working — a navy band reading the coast port by
 * port — then walks the five stages on one numbered spine: intake, memory,
 * the crew, the safety law and what comes out. The law and the weights are
 * drawn from GET /api/config, so the page can never drift from the engine.
 */

type FeedRow = {
  port: string;
  state: string;
  mode: string;
  source: string;
  latency: number;
  wave: string;
  wind: string;
  sst: string;
  vis: string;
  at: string;
};

type EngineConfig = {
  risk_weights: Record<string, number>;
  risk_thresholds: Record<string, number>;
  deterministic_overrides: Record<string, number>;
};

/** What the engine ships with — shown if /api/config cannot be reached. */
const DEFAULT_CONFIG: EngineConfig = {
  risk_weights: { wave: 0.25, cyclone: 0.25, wind: 0.2, weather: 0.1, ocean: 0.1, gis: 0.1 },
  risk_thresholds: { LOW: 25, MODERATE: 50, HIGH: 79, EXTREME: 100 },
  deterministic_overrides: {
    severe_warning_floor: 92, fishermen_warning_floor: 70, wave_danger_m: 4,
    wave_danger_floor: 85, wind_danger_kmh: 62, wind_danger_floor: 85, restricted_zone_floor: 60,
  },
};
/** Lightning's floor lives in the engine code, not the config. */
const LIGHTNING_FLOOR = 65;

const POLL_MS = 7000;

function fmt(m?: api.Measurement | null): string {
  if (!m || m.value == null) return "—";
  return `${m.value} ${m.unit}`;
}

/** "0.89 m" → ["0.89", "m"], so the number and its unit can be set apart. */
function split(reading: string): [string, string] {
  const i = reading.indexOf(" ");
  return i < 0 ? [reading, ""] : [reading.slice(0, i), reading.slice(i + 1)];
}

function categoryOf(score: number, th: Record<string, number>): RiskCategory {
  if (score <= th.LOW) return "LOW";
  if (score <= th.MODERATE) return "MODERATE";
  if (score <= th.HIGH) return "HIGH";
  return "EXTREME";
}

export default function SystemPanel({
  mode,
  language = "en",
}: {
  mode: string;
  language?: Language;
}) {
  const t = L10N[language] ?? L10N.en;
  const x = X[language] ?? X.en;
  const [rows, setRows] = useState<FeedRow[]>([]);
  const [tick, setTick] = useState(0);
  const [scanning, setScanning] = useState(true);
  const [cfg, setCfg] = useState<EngineConfig>(DEFAULT_CONFIG);
  const portIdx = useRef(0);

  useEffect(() => {
    api.config().then(setCfg).catch(() => {});
  }, []);

  // Cycle the coastline: one port per poll, newest reading on top.
  useEffect(() => {
    let alive = true;
    const read = async () => {
      const port = PORTS[portIdx.current % PORTS.length];
      portIdx.current += 1;
      try {
        const f = await api.forecast(port.lat, port.lon);
        if (!alive) return;
        const row: FeedRow = {
          port: port.name,
          state: port.state,
          mode: f.ocean.mode,
          source: f.ocean.source === "OPEN_METEO" ? "Open-Meteo" : "Demo store",
          latency: (f.ocean.latency_ms ?? 0) + (f.weather.latency_ms ?? 0),
          wave: fmt(f.ocean.measurements?.wave_height),
          wind: fmt(f.weather.measurements?.wind_speed),
          sst: fmt(f.ocean.measurements?.sst),
          vis: fmt(f.weather.measurements?.visibility),
          at: new Date().toLocaleTimeString("en-IN", { hour12: false }),
        };
        setRows((r) => [row, ...r].slice(0, 6));
        setTick((n) => n + 1);
        setScanning(true);
      } catch {
        if (alive) setScanning(false);
      }
    };
    read();
    const timer = setInterval(read, POLL_MS);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, []);

  const latest = rows[0];

  const providerText: Record<Language, { gives: string; note: string }[]> = {
    en: [
      { gives: "wave height · wave period · sea-surface temperature · currents", note: "keyless public API — verified working" },
      { gives: "wind · rain probability · visibility · air temperature", note: "keyless public API — verified working" },
      { gives: "PFZ advisories · marine warnings · satellite SST", note: "no open public JSON API — slots in behind the same interface" },
      { gives: "species occurrence records, Indian coastal waters", note: "open biodiversity data, bundled as a dated snapshot — offline-safe" },
      { gives: "rehearsed sea states, keyed by hour of day", note: "every synthetic value is labelled simulated" },
    ],
    hi: [
      { gives: "लहर की ऊँचाई · अवधि · समुद्री सतह तापमान · धाराएँ", note: "बिना कुंजी सार्वजनिक API — जाँचा हुआ" },
      { gives: "हवा · वर्षा संभावना · दृश्यता · तापमान", note: "बिना कुंजी सार्वजनिक API — जाँचा हुआ" },
      { gives: "PFZ सलाह · समुद्री चेतावनियाँ · उपग्रह SST", note: "खुला JSON API नहीं — उसी इंटरफ़ेस के पीछे जुड़ते हैं" },
      { gives: "प्रजातियों की उपस्थिति के रिकॉर्ड, भारतीय तटीय जल", note: "खुला जैवविविधता डेटा, दिनांकित स्नैपशॉट — ऑफ़लाइन-सुरक्षित" },
      { gives: "घंटे के हिसाब से तैयार समुद्री स्थितियाँ", note: "हर नक़ली मान पर 'सिम्युलेटेड' लेबल" },
    ],
    gu: [
      { gives: "મોજાંની ઊંચાઈ · સમયગાળો · સમુદ્ર તાપમાન · પ્રવાહ", note: "કી વિના જાહેર API — તપાસેલું" },
      { gives: "પવન · વરસાદની શક્યતા · દૃશ્યતા · તાપમાન", note: "કી વિના જાહેર API — તપાસેલું" },
      { gives: "PFZ સલાહ · સમુદ્રી ચેતવણીઓ · ઉપગ્રહ SST", note: "ખુલ્લું JSON API નહીં — એ જ ઇન્ટરફેસ પાછળ જોડાય છે" },
      { gives: "પ્રજાતિઓની હાજરીના રેકોર્ડ, ભારતીય કિનારાના જળ", note: "ખુલ્લો જૈવવિવિધતા ડેટા, તારીખવાર સ્નેપશોટ — ઑફલાઇન-સુરક્ષિત" },
      { gives: "કલાકદીઠ તૈયાર સમુદ્રી સ્થિતિ", note: "દરેક નકલી મૂલ્ય પર 'સિમ્યુલેટેડ' લેબલ" },
    ],
  };
  const pText = providerText[language] ?? providerText.en;

  const providers = [
    { name: "Open-Meteo Marine", status: "Live", color: "#0F8A5C", live: true, ...pText[0] },
    { name: "Open-Meteo Forecast", status: "Live", color: "#0F8A5C", live: true, ...pText[1] },
    { name: "INCOIS · IMD · MOSDAC", status: "Interface ready", color: "#A86B00", live: false, ...pText[2] },
    { name: "OBIS · Map of Life", status: "Bundled snapshot", color: "#2148BF", live: false, ...pText[3] },
    { name: "Demo store", status: "Always on", color: "#3F5A78", live: false, ...pText[4] },
  ];

  const crewText: Record<Language, { phase: string; agents: string[]; note: string }[]> = {
    en: [
      { phase: "Understand", agents: ["Intent"], note: "rule-based parsing — language, place, time. No LLM." },
      { phase: "Gather", agents: ["Weather", "Ocean", "PFZ", "Alerts", "GIS"], note: "independent specialists fan out concurrently" },
      { phase: "Decide", agents: ["Risk engine", "Route (A*)"], note: "weighted model, then floors; safest ≠ shortest" },
      { phase: "Explain", agents: ["Explanation"], note: "plain words in EN / HI / GU, spoken back" },
    ],
    hi: [
      { phase: "समझो", agents: ["आशय"], note: "नियम-आधारित — भाषा, जगह, समय। कोई LLM नहीं।" },
      { phase: "जुटाओ", agents: ["मौसम", "समुद्र", "PFZ", "चेतावनियाँ", "GIS"], note: "स्वतंत्र विशेषज्ञ एक साथ निकलते हैं" },
      { phase: "तय करो", agents: ["रिस्क इंजन", "मार्ग (A*)"], note: "भारित मॉडल, फिर नियम; सुरक्षित ≠ छोटा" },
      { phase: "समझाओ", agents: ["व्याख्या"], note: "EN / HI / GU में सीधी भाषा, बोलकर भी" },
    ],
    gu: [
      { phase: "સમજો", agents: ["ઇરાદો"], note: "નિયમ-આધારિત — ભાષા, સ્થાન, સમય. LLM નહીં." },
      { phase: "ભેગું કરો", agents: ["હવામાન", "સમુદ્ર", "PFZ", "ચેતવણીઓ", "GIS"], note: "સ્વતંત્ર નિષ્ણાતો એકસાથે નીકળે છે" },
      { phase: "નક્કી કરો", agents: ["રિસ્ક એન્જિન", "માર્ગ (A*)"], note: "ભારિત મોડેલ, પછી નિયમો; સુરક્ષિત ≠ ટૂંકો" },
      { phase: "સમજાવો", agents: ["સ્પષ્ટીકરણ"], note: "EN / HI / GU માં સરળ ભાષા, બોલીને પણ" },
    ],
  };
  const crew = crewText[language] ?? crewText.en;

  // ---- the law, from the live config: highest floor first -------------------
  const o = cfg.deterministic_overrides;
  const th = cfg.risk_thresholds;
  const floors = [
    { label: x.floors.severe, value: o.severe_warning_floor },
    {
      label: x.floors.waveWind.replace("{m}", String(o.wave_danger_m)).replace("{k}", String(o.wind_danger_kmh)),
      value: Math.max(o.wave_danger_floor, o.wind_danger_floor),
    },
    { label: x.floors.fishermen, value: o.fishermen_warning_floor },
    { label: x.floors.lightning, value: LIGHTNING_FLOOR },
    { label: x.floors.zone, value: o.restricted_zone_floor },
  ].sort((a, b) => b.value - a.value);
  const weights = Object.entries(cfg.risk_weights).sort((a, b) => b[1] - a[1]);
  const maxWeight = Math.max(...weights.map(([, w]) => w), 0.01);

  const stageBody = [
    /* 1 · intake — the providers as a status list */
    <ul key="intake" className="divide-y divide-paper-150 rounded-[12px] border border-paper-200">
      {providers.map((p) => (
        <li key={p.name} className="grid gap-x-4 gap-y-1 px-4 py-3 sm:grid-cols-[minmax(180px,220px)_1fr_auto] sm:items-center">
          <span className="flex items-center gap-2.5">
            <span
              className={`pulse-dot ${p.live ? "" : "pulse-dot--still"}`}
              style={{ background: p.color, color: p.color }}
            />
            <span className="font-display text-[19px] font-extrabold leading-tight text-ink-900">{p.name}</span>
          </span>
          <span>
            <span className="block text-[14px] leading-snug text-ink-800">{p.gives}</span>
            <span className="block text-[12.5px] leading-snug text-ink-400">{p.note}</span>
          </span>
          <span
            className="justify-self-start rounded-full px-2.5 py-0.5 text-[12px] font-bold sm:justify-self-end"
            style={{ color: p.color, background: `${p.color}14`, boxShadow: `inset 0 0 0 1.5px ${p.color}` }}
          >
            {p.status}
          </span>
        </li>
      ))}
    </ul>,

    /* 2 · memory — one number says it */
    <div key="memory" className="grid gap-5 lg:grid-cols-[auto_1fr] lg:items-center lg:gap-8">
      <div>
        <div className="font-display text-[56px] font-black leading-none tabular-nums text-ink-900">
          32 s <span className="text-chart-500">→</span> 0.02 s
        </div>
        <div className="mt-1.5 text-[13px] font-bold text-ink-500">{x.memoryCaption}</div>
      </div>
      <div>
        <div className="font-display text-[22px] font-extrabold text-ink-900">{t.cacheTitle}</div>
        <p className="mt-1 max-w-[640px] text-[14px] leading-relaxed text-ink-700">{t.cacheBody}</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-[12.5px] font-bold text-ink-700">
          <span className="rounded-full bg-paper-100 px-3 py-1">{t.oneFetch} · {t.perProvider}</span>
          <CourseArrow size={12} className="text-ink-300" />
          <span className="rounded-full bg-chart-100 px-3 py-1 text-chart-700">{t.cacheTitle}</span>
          <CourseArrow size={12} className="text-ink-300" />
          <span className="rounded-full bg-paper-100 px-3 py-1">{t.everyAgent} · {t.fromMemory}</span>
        </div>
        <p className="mt-3 max-w-[640px] text-[13px] leading-relaxed text-ink-500">{t.degrade}</p>
      </div>
    </div>,

    /* 3 · crew — four phases, then how the engine weighs what they bring */
    <div key="crew" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {crew.map((c, i) => (
          <div key={c.phase} className="rounded-[12px] bg-paper-100 px-4 py-3.5">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-display text-[22px] font-extrabold leading-none text-ink-900">{c.phase}</span>
              {i === 1 && (
                <span className="rounded-full bg-chart-100 px-2 py-0.5 text-[11.5px] font-bold text-chart-700">
                  ∥ {c.agents.length}
                </span>
              )}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {c.agents.map((a) => (
                <span key={a} className="rounded-[7px] bg-paper-50 px-2 py-1 text-[12.5px] font-bold text-ink-800 shadow-[inset_0_0_0_1px_var(--rule)]">
                  {a}
                </span>
              ))}
            </div>
            <p className="mt-2.5 text-[12.5px] leading-snug text-ink-500">{c.note}</p>
          </div>
        ))}
      </div>

      {/* weights: one series, so one hue; each bar labelled directly */}
      <figure>
        <figcaption className="text-[13.5px] font-bold text-ink-900">{x.weightsTitle}</figcaption>
        <div className="mt-2.5 space-y-2">
          {weights.map(([k, w]) => (
            <div
              key={k}
              className="grid grid-cols-[minmax(130px,190px)_1fr_44px] items-center gap-3"
              title={`${x.weights[k] ?? k}: ${Math.round(w * 100)}%`}
            >
              <span className="truncate text-[13px] text-ink-700">{x.weights[k] ?? k}</span>
              <span className="h-2 rounded-r-[4px] bg-paper-150">
                <span
                  className="grow-x block h-full rounded-r-[4px] bg-chart-500"
                  style={{ width: `${(w / maxWeight) * 100}%` }}
                />
              </span>
              <span className="text-right text-[13px] font-bold tabular-nums text-ink-900">{Math.round(w * 100)}%</span>
            </div>
          ))}
        </div>
      </figure>
    </div>,

    /* 4 · the law — every floor on the 0–100 scale, category written beside it */
    <figure key="law">
      <figcaption className="flex items-start gap-2 text-[13.5px] font-bold text-ink-900">
        <LockGlyph size={14} className="mt-0.5 shrink-0 text-risk-extreme" />
        {x.floorsCaption}
      </figcaption>
      <div className="mt-3 space-y-2.5">
        {floors.map((f) => {
          const cat = categoryOf(f.value, th);
          return (
            <div
              key={f.label}
              className="grid grid-cols-[minmax(150px,260px)_1fr_150px] items-center gap-3"
              title={`${f.label}: ≥ ${f.value} (${cat})`}
            >
              <span className="text-[13.5px] text-ink-800">{f.label}</span>
              <span className="relative h-2.5 rounded-r-[4px] bg-paper-150">
                {/* category boundaries, recessive */}
                {[th.LOW, th.MODERATE, th.HIGH].map((b) => (
                  <span key={b} aria-hidden className="absolute -top-1 h-[18px] w-px bg-ink-300/50" style={{ left: `${b}%` }} />
                ))}
                <span
                  className="grow-x absolute inset-y-0 left-0 rounded-r-[4px]"
                  style={{ width: `${f.value}%`, background: RISK_COLOR[cat] }}
                />
              </span>
              <span className="flex items-baseline gap-2 whitespace-nowrap">
                <span className="font-display text-[24px] font-black leading-none tabular-nums text-ink-900">{f.value}</span>
                <span className="text-[11.5px] font-bold text-ink-500">
                  {x.lands} {cat}
                </span>
              </span>
            </div>
          );
        })}
        {/* the scale itself, so the boundaries read as numbers */}
        <div className="grid grid-cols-[minmax(150px,260px)_1fr_150px] gap-3">
          <span />
          <span className="relative h-4 text-[11px] font-bold tabular-nums text-ink-400">
            {[0, th.LOW, th.MODERATE, th.HIGH, 100].map((b) => (
              <span key={b} className="absolute -translate-x-1/2" style={{ left: `${b}%` }}>
                {b}
              </span>
            ))}
          </span>
          <span />
        </div>
      </div>
      <p className="mt-3 max-w-[720px] text-[13.5px] leading-relaxed text-ink-700">{t.lawNote}</p>
    </figure>,

    /* 5 · out */
    <div key="out" className="grid gap-3 sm:grid-cols-3">
      {[
        { h: t.outVerdict, d: t.outVerdictD },
        { h: t.outPlan, d: t.outPlanD },
        { h: t.outLedger, d: t.outLedgerD },
      ].map((o2) => (
        <div key={o2.h} className="rounded-[12px] border-[1.5px] border-ink-900 px-4 py-3.5">
          <div className="font-display text-[26px] font-extrabold leading-none text-ink-900">{o2.h}</div>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink-700">{o2.d}</p>
        </div>
      ))}
    </div>,
  ];

  return (
    <div className="space-y-5">
      {/* ---------------- masthead ---------------- */}
      <header className="panel px-6 py-6 lg:px-8 lg:py-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="label">{t.engineRoom}</span>
          <a
            href={api.apiUrl("/config")}
            target="_blank"
            rel="noreferrer"
            title={t.configNote}
            className="text-[13px] font-bold text-chart-600 underline decoration-2 underline-offset-4 hover:text-ink-900"
          >
            {x.configLink}
          </a>
        </div>
        <h2 className="mt-2 font-display text-[clamp(40px,4.6vw,64px)] font-black leading-[0.95] text-ink-900">
          {t.title}
        </h2>
        <div className="wave-rule mt-4 max-w-[440px]" />
        <p className="mt-4 max-w-[760px] text-[15px] leading-relaxed text-ink-500">{t.intro}</p>
      </header>

      {/* ---------------- the machine, running ---------------- */}
      <section className="overflow-hidden rounded-[14px] bg-ink-900 text-paper-50" aria-live="polite">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-6 pt-5">
          <span className="flex items-center gap-2.5 text-[13px] font-bold text-ink-300">
            <span
              className={`pulse-dot ${scanning ? "" : "pulse-dot--still"}`}
              style={{ background: scanning ? "#3DDC97" : "#FF6B7A", color: scanning ? "#3DDC97" : "#FF6B7A" }}
            />
            {t.reading}
          </span>
          <span className="text-[12.5px] text-ink-300">
            {t.onePort} {POLL_MS / 1000} s · {mode} {t.flipNote}
          </span>
        </div>

        {latest ? (
          <div key={tick} className="grid gap-x-6 gap-y-4 px-6 pb-5 pt-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.3fr)_repeat(4,1fr)] lg:items-end">
            <div>
              <div className="text-[12.5px] font-bold text-ink-300">{t.nowReading}</div>
              <div className="popin font-display text-[46px] font-black leading-none text-flag">{latest.port}</div>
              <div className="mt-1.5 font-mono text-[12px] text-ink-300">
                {latest.state} · {latest.at} IST · {latest.source}
              </div>
            </div>
            {[
              { k: t.wave, v: latest.wave },
              { k: t.wind, v: latest.wind },
              { k: t.sst, v: latest.sst },
              { k: t.vis, v: latest.vis },
            ].map((r) => {
              const [n, u] = split(r.v);
              return (
                <div key={r.k}>
                  <div className="truncate text-[12.5px] font-bold text-ink-300">{r.k}</div>
                  <div className="mt-1 font-display text-[36px] font-extrabold leading-none tabular-nums">
                    {n}
                    <span className="ml-1 font-sans text-[13px] font-bold text-ink-300">{u}</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-6 pb-5 pt-3 text-[14px] text-ink-300">{scanning ? t.hailing : t.unreachable}</div>
        )}

        {/* the log */}
        <div className="overflow-x-auto border-t border-paper-50/10">
          <table className="w-full min-w-[680px] text-left font-mono text-[12px]">
            <thead>
              <tr className="font-sans text-[12px] font-bold text-ink-300">
                {[t.hPort, t.wave, t.wind, "SST", t.vis, t.hSource, t.hMode, t.hLatency, t.hAt].map((h, i) => (
                  <th key={h} className={`py-2.5 font-bold ${i === 0 ? "pl-6 pr-3" : "px-3"}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr
                  key={`${r.port}-${r.at}`}
                  className={`border-t border-paper-50/10 ${i === 0 ? "popin bg-paper-50/[0.06]" : ""}`}
                  style={{ opacity: 1 - i * 0.12 }}
                >
                  <td className="py-2 pl-6 pr-3 font-sans font-bold text-paper-50">{r.port}</td>
                  <td className="px-3 py-2 tabular-nums text-paper-50/85">{r.wave}</td>
                  <td className="px-3 py-2 tabular-nums text-paper-50/85">{r.wind}</td>
                  <td className="px-3 py-2 tabular-nums text-paper-50/85">{r.sst}</td>
                  <td className="px-3 py-2 tabular-nums text-paper-50/85">{r.vis}</td>
                  <td className="px-3 py-2 text-ink-300">{r.source}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded-full px-2 py-0.5 font-sans text-[11.5px] font-bold ${r.mode === "LIVE" ? "bg-[#3DDC97] text-ink-900" : "bg-flag text-ink-900"}`}>
                      {r.mode}
                    </span>
                  </td>
                  <td className="px-3 py-2 tabular-nums text-ink-300">{r.latency} ms</td>
                  <td className="px-3 py-2 tabular-nums text-ink-300">{r.at}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="flex items-center gap-2 border-t border-paper-50/10 px-6 py-3 text-[12.5px] leading-relaxed text-ink-300">
          <FishGlyph size={16} className="swim shrink-0 text-flag" />
          {t.feedNote}
        </p>
      </section>

      {/* ---------------- the pipeline, on one numbered spine ---------------- */}
      <ol className="panel px-5 py-7 lg:px-8">
        {x.stages.map((st, i) => (
          <li key={st.title} className="relative grid gap-4 pb-10 last:pb-0 lg:grid-cols-[230px_1fr] lg:gap-10">
            {i < x.stages.length - 1 && (
              <span aria-hidden className="absolute bottom-0 left-[19px] top-12 w-[2px] bg-paper-200" />
            )}
            <div className="flex items-start gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-flag font-display text-[20px] font-black text-ink-900">
                {i + 1}
              </span>
              <div>
                <h3 className={`font-display text-[30px] font-extrabold leading-none ${i === 3 ? "text-risk-extreme" : "text-ink-900"}`}>
                  {st.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-ink-500">{st.sub}</p>
              </div>
            </div>
            <div className="min-w-0 pl-14 lg:pl-0">{stageBody[i]}</div>
          </li>
        ))}
      </ol>
    </div>
  );
}
