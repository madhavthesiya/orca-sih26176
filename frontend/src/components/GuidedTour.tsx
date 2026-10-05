import { useEffect, useRef, useState } from "react";
import type { Language } from "../types";
import { PauseGlyph, PlayGlyph } from "./glyphs";

type L10n = Record<Language, string>;

export interface TourStep {
  title: L10n;
  say: L10n;
  /** Question to run through the full agent pipeline for this step. */
  ask?: string;
  /** Switch view before narrating. */
  tab?: "home" | "ask" | "authority" | "system";
  /** How long to dwell after the action, in ms. */
  dwell: number;
  /** Highlighted feature name shown as a chip. */
  feature?: string;
  /** Continue the existing conversation instead of starting a fresh one. */
  followUp?: boolean;
}

/**
 * The scripted walkthrough. Runs unattended — this is both the "explain the
 * product in 3 minutes" tour and the fallback if a live demo goes wrong.
 */
export const TOUR: TourStep[] = [
  {
    title: {
      en: "What ORCA is",
      hi: "ORCA क्या है",
    gu: "ORCA શું છે",
    },
    say: {
      en: "ORCA is not a chatbot. It is a crew of ten AI agents that read India's marine data together and return one safe, explainable decision for a fisher.",
      hi: "ORCA कोई चैटबॉट नहीं है। यह दस AI एजेंटों की एक टीम है जो भारत का समुद्री डेटा मिलकर पढ़ती है और मछुआरे के लिए एक सुरक्षित, समझाने योग्य फ़ैसला देती है।",
    gu: "ORCA ચેટબોટ નથી. આ દસ AI એજન્ટોની ટીમ છે જે ભારતનો સમુદ્રી ડેટા એકસાથે વાંચે છે અને માછીમાર માટે એક સુરક્ષિત, સમજૂતી સાથેનો નિર્ણય આપે છે.",
    },
    tab: "home",
    dwell: 7000,
    feature: "Overview",
  },
  {
    title: {
      en: "It opens knowing where you are",
      hi: "खुलते ही आपकी जगह जानता है",
    gu: "ખોલતા જ તમારું સ્થાન ઓળખે છે",
    },
    say: {
      en: "The moment the app opens it finds the fisher's position and reads the sea around it — no typing, no settings. He sees his answer before he asks a question.",
      hi: "ऐप खुलते ही मछुआरे की जगह ढूँढ लेता है और आसपास का समुद्र पढ़ लेता है — न कुछ टाइप करना, न कोई सेटिंग। सवाल पूछने से पहले ही जवाब सामने होता है।",
    gu: "એપ ખોલતા જ માછીમારનું સ્થાન શોધે છે અને આસપાસનો સમુદ્ર વાંચે છે — ટાઇપિંગ નહીં, સેટિંગ નહીં. પ્રશ્ન પૂછતા પહેલા જ જવાબ સામે હોય છે.",
    },
    tab: "home",
    dwell: 9000,
    feature: "Auto location",
  },
  {
    title: {
      en: "Plain words, not weather jargon",
      hi: "सीधी भाषा, मौसम की तकनीकी नहीं",
    gu: "સરળ ભાષા, હવામાનની જટિલતા નહીં",
    },
    say: {
      en: "Everything is written the way a fisherman speaks: do not enter the red area between 2 PM and 6 PM, areas 1, 2 and 3 are your best chances, stay about three hours.",
      hi: "सब कुछ उसी भाषा में जो मछुआरा बोलता है: दोपहर 2 से 6 बजे तक लाल इलाक़े में मत जाओ, जगह 1, 2, 3 सबसे अच्छी हैं, क़रीब तीन घंटे रुको।",
    gu: "બધું માછીમારની ભાષામાં: બપોરે 2 થી 6 લાલ વિસ્તારમાં ન જાઓ, જગ્યા 1, 2, 3 શ્રેષ્ઠ છે, લગભગ ત્રણ કલાક રોકાઓ.",
    },
    tab: "home",
    dwell: 10000,
    feature: "Plain language",
  },
  {
    title: {
      en: "Where the fish are, within 100 km",
      hi: "100 किमी में मछली कहाँ है",
    gu: "100 કિમીમાં માછલી ક્યાં છે",
    },
    say: {
      en: "ORCA scores every ground within 100 kilometres for the chance of fish, and ranks them by what the trip is actually worth — a slightly better ground twice as far is usually the wrong advice.",
      hi: "ORCA 100 किलोमीटर के हर इलाक़े को मछली मिलने की संभावना पर आँकता है, और यात्रा की असली क़ीमत से रैंक करता है — थोड़ी बेहतर पर दुगनी दूर जगह अक्सर ग़लत सलाह होती है।",
    gu: "ORCA 100 કિમીની અંદર દરેક જગ્યાને માછલી મળવાની શક્યતા પર ગુણ આપે છે, અને સફર ખરેખર કેટલી ફાયદાકારક છે તેના આધારે ક્રમ આપે છે.",
    },
    tab: "home",
    dwell: 10000,
    feature: "Fishing probability",
  },
  {
    title: {
      en: "How long to stay, and the next two days",
      hi: "कितनी देर रुकें, और अगले दो दिन",
    gu: "કેટલો સમય રોકાવું, અને આગળના બે દિવસ",
    },
    say: {
      en: "It recommends how many hours to work the ground, what the trip should earn after fuel, and shows whether tomorrow or the day after will be better.",
      hi: "यह बताता है कि कितने घंटे काम करें, ईंधन के बाद यात्रा से कितना मिलेगा, और कल या परसों बेहतर होगा या नहीं।",
    gu: "કેટલા કલાક કામ કરવું, બળતણ પછી સફરમાંથી કેટલું મળશે, અને આવતીકાલે કે પરમદિવસે સારું રહેશે કે નહીં — તે જણાવે છે.",
    },
    tab: "home",
    dwell: 9000,
    feature: "Trip plan · economics",
  },
  {
    title: {
      en: "Ask in your own language",
      hi: "अपनी भाषा में पूछिए",
    gu: "તમારી ભાષામાં પૂછો",
    },
    say: {
      en: "A fisherman near Mumbai asks in Marathi whether he can go out at 6 AM tomorrow. ORCA detects the language itself — no setting to change.",
      hi: "मुंबई के पास एक मछुआरा मराठी में पूछता है कि कल सुबह 6 बजे जा सकता है या नहीं। ORCA भाषा ख़ुद पहचान लेता है — कोई सेटिंग नहीं बदलनी।",
    gu: "મુંબઈ નજીકનો માછીમાર પૂછે છે — શું હું આવતીકાલે સવારે 6 વાગ્યે જઈ શકું? ORCA જાતે ભાષા ઓળખે છે.",
    },
    ask: "मी उद्या सकाळी ६ वाजता मुंबईजवळ मासेमारीला जाऊ शकतो का?",
    dwell: 9000,
    feature: "Multilingual · voice",
  },
  {
    title: {
      en: "A decision, with reasons",
      hi: "फ़ैसला, कारणों के साथ",
    gu: "નિર્ણય, કારણો સાથે",
    },
    say: {
      en: "70 out of 100 — HIGH RISK. Every point is attributed: an active IMD fishermen warning, high waves, strong winds. Nothing is a black box.",
      hi: "100 में 70 — ज़्यादा जोखिम। हर अंक का हिसाब है: IMD की सक्रिय चेतावनी, ऊँची लहरें, तेज़ हवा। कुछ भी ब्लैक बॉक्स नहीं।",
    gu: "100 માંથી 70 — ઉચ્ચ જોખમ. દરેક ગુણનો હિસાબ છે: IMD ની સક્રિય ચેતવણી, ઊંચા મોજા, જોરદાર પવન.",
    },
    dwell: 9000,
    feature: "Explainable risk",
  },
  {
    title: {
      en: "It knows when to go instead",
      hi: "कब जाना ठीक है, यह भी बताता है",
    gu: "ક્યારે જવું યોગ્ય છે, તે પણ જણાવે છે",
    },
    say: {
      en: "The 24-hour timeline shows the safe window. ORCA does not just say no — it says conditions improve after 11:00, come back then.",
      hi: "24 घंटे की टाइमलाइन सुरक्षित समय दिखाती है। ORCA सिर्फ़ मना नहीं करता — कहता है 11 बजे के बाद हालात सुधरेंगे, तब आइए।",
    gu: "24 કલાકની ટાઇમલાઇન સુરક્ષિત સમય દર્શાવે છે. ORCA માત્ર ના પાડતું નથી — 11 પછી પરિસ્થિતિ સુધરશે તેમ કહે છે.",
    },
    dwell: 8000,
    feature: "Risk timeline",
  },
  {
    title: {
      en: "It remembers the conversation",
      hi: "बातचीत याद रखता है",
    gu: "વાતચીત યાદ રાખે છે",
    },
    say: {
      en: "He asks a follow-up: what about 12 PM? ORCA keeps the place and the day, re-checks only what changed, and the risk drops to MODERATE.",
      hi: "वह आगे पूछता है: दोपहर 12 बजे क्या? ORCA जगह और दिन याद रखता है, सिर्फ़ बदला हुआ दोबारा जाँचता है, और जोखिम घटकर मध्यम हो जाता है।",
    gu: "તે આગળ પૂછે છે: બપોરે 12 વાગ્યે કેવું રહેશે? ORCA જગ્યા અને દિવસ યાદ રાખે છે.",
    },
    ask: "दुपारी १२ वाजता काय?",
    followUp: true, // must NOT reset the session — that is the whole point
    dwell: 9000,
    feature: "Context memory",
  },
  {
    title: {
      en: "Official warnings always win",
      hi: "आधिकारिक चेतावनी हमेशा ऊपर",
    gu: "સત્તાવાર ચેતવણી હંમેશા ઉપર",
    },
    say: {
      en: "Near Paradip a severe cyclone warning is in force — and the storm is drawn on the chart, warning area hatched, track heading for the coast. A deterministic rule forces EXTREME.",
      hi: "पारादीप के पास भीषण चक्रवात की चेतावनी लागू है — तूफ़ान नक़्शे पर बना है, चेतावनी क्षेत्र और तट की ओर उसका रास्ता भी। एक निश्चित नियम EXTREME लागू कर देता है।",
    gu: "પારાદીપ નજીક તીવ્ર વાવાઝોડાની ચેતવણી લાગુ છે. કડક નિયમ EXTREME લાગુ કરે છે.",
    },
    ask: "Is there a cyclone near Paradip? Can I go fishing?",
    dwell: 10000,
    feature: "Safety override",
  },
  {
    title: {
      en: "Where the fish are likely to be",
      hi: "मछली कहाँ मिल सकती है",
    gu: "માછલી ક્યાં મળી શકે છે",
    },
    say: {
      en: "Asked in Hindi near Kochi, ORCA ranks potential fishing zones from sea-surface-temperature fronts and chlorophyll — the same reasoning INCOIS uses. It never claims to see fish.",
      hi: "कोच्चि के पास हिंदी में पूछने पर ORCA तापमान और क्लोरोफिल से संभावित मत्स्य क्षेत्र रैंक करता है — वही तरीक़ा जो INCOIS अपनाता है। मछली देखने का दावा कभी नहीं करता।",
    gu: "કોચી નજીક ORCA તાપમાન અને ક્લોરોફિલ પરથી સંભવિત માછીમારી વિસ્તારો ક્રમમાં ગોઠવે છે.",
    },
    ask: "कोच्चि के पास मछली पकड़ने का क्षेत्र कहाँ है?",
    dwell: 10000,
    feature: "PFZ intelligence",
  },
  {
    title: {
      en: "The safest route is not the shortest",
      hi: "सबसे सुरक्षित रास्ता सबसे छोटा नहीं",
    gu: "સૌથી સુરક્ષિત માર્ગ સૌથી ટૂંકો નથી",
    },
    say: {
      en: "The direct track to the fishing ground cuts through a port channel and a naval exercise area. ORCA plans around them — five kilometres longer, and legal.",
      hi: "सीधा रास्ता बंदरगाह चैनल और नौसेना क्षेत्र से होकर जाता है। ORCA उनके चारों ओर से योजना बनाता है — पाँच किलोमीटर लंबा, पर क़ानूनी।",
    gu: "સીધો માર્ગ બંદર ચેનલમાંથી પસાર થાય છે. ORCA તેને ટાળીને માર્ગ બનાવે છે.",
    },
    ask: "Give me the safest route to the nearest fishing zone near Mumbai",
    dwell: 11000,
    feature: "Route + geofencing",
  },
  {
    title: {
      en: "Drag the boat anywhere",
      hi: "नाव कहीं भी खींचिए",
    gu: "હોડી ગમે ત્યાં ખેંચો",
    },
    say: {
      en: "The vessel marker is draggable. Drop it near a restricted area and ORCA geofences that exact position live — this is what warns a fisher before he crosses a maritime boundary.",
      hi: "नाव का निशान खींचा जा सकता है। प्रतिबंधित क्षेत्र के पास छोड़िए और ORCA उसी जगह की जाँच तुरंत करता है — यही मछुआरे को सीमा पार करने से पहले चेताता है।",
    gu: "હોડીનો માર્કર ખેંચી શકાય છે. તેને પ્રતિબંધિત વિસ્તાર નજીક છોડો અને ORCA તરત જ તેની તપાસ કરે છે.",
    },
    dwell: 9000,
    feature: "Live geofence",
  },
  {
    title: {
      en: "Ten agents, working in parallel",
      hi: "दस एजेंट, एक साथ",
    gu: "દસ એજન્ટ, એકસાથે",
    },
    say: {
      en: "The agent panel shows what actually ran: weather, ocean, fishing zones, alerts and GIS all fan out concurrently, then the risk engine waits for every one of them.",
      hi: "एजेंट पैनल दिखाता है कि असल में क्या चला: मौसम, समुद्र, मत्स्य क्षेत्र, चेतावनियाँ और GIS साथ-साथ चलते हैं, फिर रिस्क इंजन सबका इंतज़ार करता है।",
    gu: "એજન્ટ પેનલ દર્શાવે છે કે ખરેખર શું ચાલી રહ્યું છે.",
    },
    dwell: 9000,
    feature: "Agent crew",
  },
  {
    title: {
      en: "The engine room",
      hi: "इंजन रूम",
    gu: "એન્જિન રૂમ",
    },
    say: {
      en: "The system view shows the whole machine running: live providers feeding a 72-hour series cache, ten agents fanning out, the safety floors no model can undo — and the coast being read live, port by port.",
      hi: "सिस्टम व्यू पूरी मशीन चलती हुई दिखाता है: लाइव स्रोत, 72 घंटे का कैश, दस एजेंट, सुरक्षा नियम जिन्हें कोई मॉडल नहीं बदल सकता — और तट की लाइव रीडिंग, बंदरगाह-दर-बंदरगाह।",
    gu: "સિસ્ટમ વ્યૂ આખી સિસ્ટમ ચાલતી દર્શાવે છે.",
    },
    tab: "system" as const,
    dwell: 11000,
    feature: "Architecture · live feed",
  },
  {
    title: {
      en: "It scales past one fisherman",
      hi: "एक मछुआरे से आगे",
    gu: "એક માછીમારની આગળ",
    },
    say: {
      en: "The authority view scores every landing centre on the coast with the same engine — the district administration sees the same evidence the fisher sees.",
      hi: "प्रशासन व्यू उसी इंजन से तट के हर लैंडिंग सेंटर को आँकता है — ज़िला प्रशासन वही प्रमाण देखता है जो मछुआरा देखता है।",
    gu: "વહીવટી વ્યૂ દરેક લેન્ડિંગ સેન્ટરને ગુણ આપે છે — વહીવટીતંત્રને એ જ પુરાવા દેખાય છે.",
    },
    tab: "authority" as const,
    dwell: 10000,
    feature: "Authority dashboard",
  },
  {
    title: {
      en: "Built to be trusted",
      hi: "भरोसे के लिए बना",
    gu: "વિશ્વાસ માટે બનાવેલું",
    },
    say: {
      en: "Every value carries its source, timestamp and confidence. Simulated data is always labelled. ORCA is decision support — it never replaces an official advisory.",
      hi: "हर मान के साथ उसका स्रोत, समय और भरोसा है। नक़ली डेटा पर हमेशा लेबल है। ORCA निर्णय में सहायक है — आधिकारिक सलाह की जगह कभी नहीं लेता।",
    gu: "દરેક મૂલ્ય સાથે તેનો સ્રોત, સમય અને વિશ્વાસ છે. ORCA સત્તાવાર સલાહનું સ્થાન ક્યારેય લેતું નથી.",
    },
    tab: "home",
    dwell: 8000,
    feature: "Provenance",
  },
];

const CONTROLS: Record<Language, { prev: string; next: string; pause: string; resume: string; exit: string; keys: string }> = {
  en: { prev: "Previous step", next: "Next step", pause: "Pause", resume: "Resume", exit: "Exit tour", keys: "Esc closes · ← → move" },
  hi: { prev: "पिछला चरण", next: "अगला चरण", pause: "रोकें", resume: "जारी रखें", exit: "टूर बंद करें", keys: "Esc बंद करे · ← → आगे-पीछे" },
  gu: { prev: "પાછલું પગલું", next: "આગલું પગલું", pause: "રોકો", resume: "ચાલુ રાખો", exit: "ટૂર બંધ કરો", keys: "Esc બંધ કરે · ← → આગળ-પાછળ" },
};

/** Keys belong to the tour only when the reader is not typing somewhere. */
function typingInto(el: EventTarget | null): boolean {
  if (!(el instanceof HTMLElement)) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

export default function GuidedTour({
  step,
  language = "en",
  paused,
  onPause,
  onNext,
  onPrev,
  onExit,
}: {
  step: number;
  language?: Language;
  paused: boolean;
  onPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  onExit: () => void;
}) {
  const s = TOUR[step];
  const [progress, setProgress] = useState(0);
  const startedAt = useRef<number>(Date.now());
  const nextRef = useRef<HTMLButtonElement>(null);
  const c = CONTROLS[language] ?? CONTROLS.en;

  // Focus comes into the tour when it opens and goes back where it was when
  // it closes, so a keyboard user never loses their place on the page.
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    nextRef.current?.focus({ preventScroll: true });
    return () => before?.focus?.({ preventScroll: true });
  }, []);

  // Esc closes; arrows step — unless the reader is typing a question.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typingInto(e.target) || e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "Escape") onExit();
      else if (e.key === "ArrowRight") onNext();
      else if (e.key === "ArrowLeft" && step > 0) onPrev();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, onExit, onNext, onPrev]);

  // Progress bar driven by wall-clock, not rAF, so it still advances when the
  // window is not compositing.
  useEffect(() => {
    startedAt.current = Date.now();
    setProgress(0);
    if (paused) return;
    const id = window.setInterval(() => {
      setProgress(Math.min(1, (Date.now() - startedAt.current) / s.dwell));
    }, 100);
    return () => window.clearInterval(id);
  }, [step, paused, s.dwell]);

  if (!s) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[1000] flex justify-center p-4">
      <div
        role="dialog"
        aria-modal="false"
        aria-labelledby="tour-title"
        aria-describedby="tour-say"
        className="panel rule-double pointer-events-auto w-full max-w-3xl shadow-2xl"
        style={{ background: "var(--paper-bright)" }}
      >
        {/* progress */}
        <div className="h-[3px] bg-ink-900/10">
          <div
            className="h-full bg-ink-900 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="flex items-start gap-4 px-5 py-4">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[6px] bg-ink-900 font-display text-[16px] font-black text-paper-50">
            {step + 1}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 id="tour-title" className="font-display text-[16px] font-bold text-ink-900">
                {s.title[language] ?? s.title.en}
              </h3>
              {s.feature && (
                <span className="border border-chart-500/50 bg-chart-100/50 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-chart-700">
                  {s.feature}
                </span>
              )}
              <span className="ml-auto font-mono text-[10px] tabular-nums text-ink-400">
                {step + 1} / {TOUR.length}
              </span>
            </div>
            <p id="tour-say" aria-live="polite" className="mt-1.5 text-[13.5px] leading-relaxed text-ink-700">
              {s.say[language] ?? s.say.en}
            </p>
            <p className="mt-1 hidden text-[11.5px] text-ink-400 sm:block">{c.keys}</p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              onClick={onPrev}
              disabled={step === 0}
              title={c.prev}
              aria-label={c.prev}
              className="btn-square !h-8 !w-8 disabled:opacity-30"
            >
              ‹
            </button>
            <button
              onClick={onPause}
              title={paused ? c.resume : c.pause}
              aria-label={paused ? c.resume : c.pause}
              className="grid h-9 w-9 place-items-center rounded-[6px] bg-ink-900 text-paper-50 transition hover:bg-ink-700"
            >
              {paused ? <PlayGlyph size={12} /> : <PauseGlyph size={12} />}
            </button>
            <button ref={nextRef} onClick={onNext} title={c.next} aria-label={c.next} className="btn-square !h-8 !w-8">
              ›
            </button>
            <button
              onClick={onExit}
              title={c.exit}
              aria-label={c.exit}
              className="btn-square !h-8 !w-8 hover:!border-risk-extreme hover:!bg-risk-extreme"
            >
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
