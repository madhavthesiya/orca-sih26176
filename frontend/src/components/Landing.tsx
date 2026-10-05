import { useEffect, useState, type ReactNode } from "react";
import * as api from "../api";
import type { Language } from "../types";
import { CompassMark, CourseArrow, FishGlyph, PhoneGlyph, PlayGlyph } from "./glyphs";

/** Every word on the front door, in the fisher's three languages. */
const L10N: Record<
  Language,
  {
    tag1: string;
    tag2a: string;
    tag2b: string;
    tag2c: string;
    sub: string;
    ctaTour: string;
    ctaOpen: string;
    ctaPhone: string;
    ctaTry: string;
    openOrca: string;
    openWord: string;
    watchLive: string;
    pipelineTitle: string;
    stats: string[];
    cards: { kicker: string; title: string; lines: string[] }[];
    phases: { t: string; n: string }[];
    footer: string;
  }
> = {
  en: {
    tag1: "Ten agents read the sea.",
    tag2a: "One safe, ",
    tag2b: "explainable",
    tag2c: " decision.",
    sub: "Marine EcOsystem Reasoning with Collaborative Agents — India's marine data turned into plain words a fisher can act on, in his own language, with every number carrying its source.",
    ctaTour: "Watch the guided tour",
    ctaOpen: "Open the app",
    ctaPhone: "Phone version",
    ctaTry: "Try: cyclone near Paradip →",
    openOrca: "Open ORCA",
    openWord: "Open",
    watchLive: "watch it run live →",
    pipelineTitle: "How ORCA decides",
    stats: ["Agents in the crew", "Landing centres", "Official warnings", "Languages", "Data edition"],
    cards: [
      {
        kicker: "Today's plan",
        title: "Where the fish are",
        lines: [
          "Opens knowing where you are — reads 100 km of sea unprompted",
          "Every ground scored for chance of fish, with the why behind it",
          "Trip plan: when to go, how long to stay, what it should earn",
        ],
      },
      {
        kicker: "Ask ORCA",
        title: "Your language, spoken or typed",
        lines: [
          "English · हिंदी · मराठी — detected, never configured",
          "A 0–100 risk verdict where every point is attributed",
          "Official warnings override the model. Always.",
        ],
      },
      {
        kicker: "Authority",
        title: "The district view",
        lines: [
          "Every landing centre on the coast, scored by the same engine",
          "The administration sees the same evidence the fisher sees",
          "One-click CSV export for the day's advisory board",
        ],
      },
    ],
    phases: [
      { t: "Understand", n: "parse the question, any language" },
      { t: "Gather", n: "five specialists fan out concurrently" },
      { t: "Decide", n: "weighted model + safety floors that only raise" },
      { t: "Explain", n: "plain words, with sources, spoken back" },
    ],
    footer:
      "Demo / simulated data is always labelled · ORCA is decision support — never a replacement for an official advisory",
  },
  hi: {
    tag1: "दस एजेंट समुद्र पढ़ते हैं।",
    tag2a: "एक सुरक्षित, ",
    tag2b: "समझाने योग्य",
    tag2c: " फ़ैसला।",
    sub: "भारत का समुद्री डेटा, मछुआरे की अपनी भाषा में, सीधे काम आने वाले शब्दों में — और हर आँकड़े के साथ उसका स्रोत।",
    ctaTour: "गाइडेड टूर देखें",
    ctaOpen: "ऐप खोलें",
    ctaPhone: "फ़ोन संस्करण",
    ctaTry: "देखें: पारादीप के पास चक्रवात →",
    openOrca: "ORCA खोलें",
    openWord: "खोलें",
    watchLive: "इसे चलते हुए देखें →",
    pipelineTitle: "ORCA फ़ैसला कैसे करता है",
    stats: ["टीम के एजेंट", "लैंडिंग सेंटर", "आधिकारिक चेतावनियाँ", "भाषाएँ", "डेटा संस्करण"],
    cards: [
      {
        kicker: "आज की योजना",
        title: "मछली कहाँ है",
        lines: [
          "खुलते ही आपकी जगह जानता है — 100 किमी समुद्र ख़ुद पढ़ता है",
          "हर इलाक़े को मछली की संभावना पर अंक, कारण के साथ",
          "यात्रा योजना: कब जाएँ, कितना रुकें, कितना मिलेगा",
        ],
      },
      {
        kicker: "ORCA से पूछें",
        title: "आपकी भाषा, बोलकर या लिखकर",
        lines: [
          "English · हिंदी · मराठी — ख़ुद पहचानता है, कोई सेटिंग नहीं",
          "0–100 का जोखिम, हर अंक के हिसाब के साथ",
          "आधिकारिक चेतावनी मॉडल से हमेशा ऊपर।",
        ],
      },
      {
        kicker: "प्रशासन",
        title: "ज़िले का नज़ारा",
        lines: [
          "तट का हर लैंडिंग सेंटर, उसी इंजन से आँका हुआ",
          "प्रशासन वही प्रमाण देखता है जो मछुआरा देखता है",
          "दिन के बोर्ड का एक-क्लिक CSV निर्यात",
        ],
      },
    ],
    phases: [
      { t: "समझो", n: "सवाल परखो, किसी भी भाषा में" },
      { t: "जुटाओ", n: "पाँच विशेषज्ञ एक साथ निकलते हैं" },
      { t: "तय करो", n: "भारित मॉडल + नियम जो सिर्फ़ जोखिम बढ़ाते हैं" },
      { t: "समझाओ", n: "सीधी भाषा, स्रोतों के साथ, बोलकर भी" },
    ],
    footer:
      "नक़ली/डेमो डेटा पर हमेशा लेबल · ORCA निर्णय-सहायक है — आधिकारिक सलाह का विकल्प कभी नहीं",
  },
  gu: {
    tag1: "દસ એજન્ટ સમુદ્ર વાંચે છે.",
    tag2a: "એક સુરક્ષિત, ",
    tag2b: "સમજાવી શકાય તેવો",
    tag2c: " નિર્ણય.",
    sub: "ભારતનો સમુદ્રી ડેટા, માછીમારની પોતાની ભાષામાં, સીધા કામમાં આવતા શબ્દોમાં — અને દરેક આંકડા સાથે તેનો સ્રોત.",
    ctaTour: "ગાઇડેડ ટૂર જુઓ",
    ctaOpen: "એપ ખોલો",
    ctaPhone: "ફોન આવૃત્તિ",
    ctaTry: "જુઓ: પારાદીપ નજીક વાવાઝોડું →",
    openOrca: "ORCA ખોલો",
    openWord: "ખોલો",
    watchLive: "તેને ચાલતું જુઓ →",
    pipelineTitle: "ORCA કેવી રીતે નિર્ણય લે છે",
    stats: ["ટીમના એજન્ટ", "લેન્ડિંગ સેન્ટર", "સત્તાવાર ચેતવણીઓ", "ભાષાઓ", "ડેટા આવૃત્તિ"],
    cards: [
      {
        kicker: "આજની યોજના",
        title: "માછલી ક્યાં છે",
        lines: [
          "ખોલતા જ તમારી જગ્યા જાણે છે — 100 કિ.મી. સમુદ્ર જાતે વાંચે છે",
          "દરેક વિસ્તારને માછલીની શક્યતા પર ગુણ, કારણ સાથે",
          "સફરની યોજના: ક્યારે જવું, કેટલું રોકાવું, કેટલું મળશે",
        ],
      },
      {
        kicker: "ORCA ને પૂછો",
        title: "તમારી ભાષા, બોલીને અથવા લખીને",
        lines: [
          "English · हिंदी · ગુજરાતી — જાતે જ ઓળખે છે, કોઈ સેટિંગ નહીં",
          "0–100 નું જોખમ, દરેક ગુણના હિસાબ સાથે",
          "સત્તાવાર ચેતવણી મોડેલથી હંમેશા ઉપર.",
        ],
      },
      {
        kicker: "વહીવટીતંત્ર",
        title: "જિલ્લાનું દૃશ્ય",
        lines: [
          "કિનારાનું દરેક લેન્ડિંગ સેન્ટર, એ જ એન્જિન દ્વારા તપાસાયેલું",
          "વહીવટીતંત્ર એ જ પુરાવા જુએ છે જે માછીમાર જુએ છે",
          "દિવસના બોર્ડની એક-ક્લિક CSV નિકાસ",
        ],
      },
    ],
    phases: [
      { t: "સમજો", n: "પ્રશ્ન પારખો, કોઈપણ ભાષામાં" },
      { t: "ભેગું કરો", n: "પાંચ નિષ્ણાતો એકસાથે નીકળે છે" },
      { t: "નક્કી કરો", n: "ભારિત મોડેલ + નિયમો જે માત્ર જોખમ વધારે છે" },
      { t: "સમજાવો", n: "સરળ ભાષા, સ્રોતો સાથે, બોલીને પણ" },
    ],
    footer:
      "નકલી/ડેમો ડેટા પર હંમેશા લેબલ · ORCA નિર્ણય-સહાયક છે — સત્તાવાર સલાહનો વિકલ્પ ક્યારેય નહીં",
  },
};

/** Honour the OS "reduce motion" setting — those users get the finished page. */
function prefersStill(): boolean {
  return (
    typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Entrance choreography with a projector fail-safe: visibility is driven by
 * STATE + CSS transitions, never by keyframes with fill-mode. If rAF is
 * suspended (hidden tab, non-compositing output) the timeout still flips the
 * state, so the end position — everything visible — is always reached; with
 * reduced motion the content simply starts there.
 */
function Reveal({
  delay = 0,
  className = "",
  children,
}: {
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  const [on, setOn] = useState(prefersStill);
  useEffect(() => {
    if (on) return;
    const raf = requestAnimationFrame(() => setOn(true));
    const settle = window.setTimeout(() => setOn(true), 500);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div
      className={className}
      style={{
        opacity: on ? 1 : 0,
        transform: on ? "none" : "translateY(16px)",
        transition: prefersStill()
          ? "none"
          : `opacity 0.65s ease ${delay}ms, transform 0.65s cubic-bezier(0.2, 0.7, 0.3, 1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/** Count-up with the same fail-safe as the risk dial: the number always lands. */
function useCountUp(target: number | null, ms = 1000): string {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (target == null) return;
    if (prefersStill()) {
      setV(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - start) / ms));
      setV(Math.round(target * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const settle = window.setTimeout(() => setV(target), ms + 150);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
    };
  }, [target, ms]);
  return target == null ? "—" : String(v);
}

/**
 * The front door — the chart sheet before you step aboard.
 *
 * One screen that says what ORCA is (ten agents, one safe, explainable
 * decision), proves it is alive (live coastline stats, a running course),
 * and hands the judge three doors in.
 */
export default function Landing({
  mode,
  language = "en",
  onLanguage,
  onEnter,
  onTour,
  onScenario,
}: {
  mode: string;
  language?: Language;
  onLanguage: (lang: Language) => void;
  onEnter: (tab: "home" | "ask" | "authority" | "system") => void;
  onTour: () => void;
  onScenario: (ask: string) => void;
}) {
  const t = L10N[language] ?? L10N.en;
  const [centres, setCentres] = useState<number | null>(null);
  const [warnings, setWarnings] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .authority()
      .then((d) => {
        if (!alive) return;
        setCentres(d.summary.monitored ?? null);
        setWarnings(d.summary.official_warnings ?? null);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const agentsN = useCountUp(10, 900);
  const centresN = useCountUp(centres, 1100);
  const warningsN = useCountUp(warnings, 1300);
  const langsN = useCountUp(3, 800);

  const cardTabs: ("home" | "ask" | "authority")[] = ["home", "ask", "authority"];

  const stats = [
    { k: t.stats[0], v: agentsN },
    { k: t.stats[1], v: centresN },
    { k: t.stats[2], v: warningsN, warn: (warnings ?? 0) > 0 },
    { k: t.stats[3], v: langsN },
    { k: t.stats[4], v: mode },
  ];

  return (
    <div className="mx-auto flex min-h-full max-w-[1240px] flex-col px-5 py-5">

      {/* top strip */}
      <Reveal>
        <div className="flex flex-wrap items-center gap-3">
          <CompassMark size={32} className="text-ink-900" />
          <div className="flex flex-col">
            <span className="text-[13.5px] font-bold text-ink-900">
              SIH26176 · ISRO · Smart India Hackathon 2026
            </span>
            <span className="text-[12px] text-ink-400">
              Team ID 138259 · SagarMitra · Space Technology
            </span>
          </div>
          <span className="ml-auto flex gap-1">
            {(["en", "hi", "gu"] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => onLanguage(l)}
                className={`rounded-[7px] px-2.5 py-1 text-[13px] font-bold transition ${
                  language === l ? "bg-ink-900 text-paper-50" : "text-ink-400 hover:text-ink-900"
                }`}
              >
                {l === "en" ? "EN" : l === "hi" ? "हिं" : "ગુજ"}
              </button>
            ))}
          </span>
          <button onClick={() => onEnter("home")} className="btn-ink group">
            {t.openOrca}{" "}
            <CourseArrow size={13} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </Reveal>


      {/* hero */}
      <div className="mt-10 grid items-end gap-10 lg:mt-12 lg:grid-cols-[1fr_420px]">
        <div>
          <Reveal delay={80}>
            {/* the name, painted like a hull registration */}
            <h1 className="font-display text-[clamp(124px,19vw,268px)] font-black leading-[0.78] text-ink-900">
              ORCA
            </h1>
            <div className="wave-rule mt-6 max-w-[620px]" />
          </Reveal>
          <Reveal delay={200}>
            <p className="mt-6 max-w-[600px] text-[23px] font-bold leading-snug text-ink-900">
              {t.tag1}
              <br />
              {t.tag2a}
              {t.tag2b}
              {t.tag2c}
            </p>
            <p className="mt-3 max-w-[560px] text-[15.5px] leading-relaxed text-ink-500">{t.sub}</p>
          </Reveal>

          <Reveal delay={330}>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <button onClick={onTour} className="btn-ink !px-5 !py-2.5">
                <PlayGlyph size={11} /> {t.ctaTour}
              </button>
              <button onClick={() => onEnter("home")} className="btn-line !px-5 !py-2.5">
                {t.ctaOpen}
              </button>
              {/* full reload on purpose: phone vs console is decided at boot */}
              <button
                onClick={() => (window.location.href = `/?m=1&lang=${language}`)}
                className="btn-line !px-5 !py-2.5"
              >
                <PhoneGlyph size={15} /> {t.ctaPhone}
              </button>
              <button
                onClick={() => onScenario("Is there a cyclone near Paradip? Can I go fishing?")}
                className="text-[14px] font-bold text-chart-600 underline decoration-2 underline-offset-4 transition-colors hover:text-ink-900"
              >
                {t.ctaTry}
              </button>
            </div>
          </Reveal>
        </div>

        {/* hero art: the product's promise, drawn as a living plotted course */}
        <Reveal delay={260} className="hidden justify-self-end lg:block">
          <svg viewBox="0 0 440 300" className="w-full max-w-[420px] rounded-[14px] bg-paper-50" aria-hidden>
            {/* the water itself */}
            <rect x="0" y="0" width="440" height="300" fill="#3461D9" opacity="0.06" />
            <rect x="0" y="150" width="440" height="150" fill="#3461D9" opacity="0.05" />
            {/* graticule */}
            {[60, 130, 200, 270].map((y) => (
              <line key={y} x1="0" y1={y} x2="440" y2={y} stroke="#3461D9" strokeWidth="0.5" opacity="0.2" />
            ))}
            {[80, 180, 280, 380].map((x) => (
              <line key={x} x1={x} y1="0" x2={x} y2="300" stroke="#3461D9" strokeWidth="0.5" opacity="0.2" />
            ))}
            {/* a school working the water under the course */}
            <g fill="#2148BF" opacity="0.5">
              <g className="svg-swim">
                <path d="M96 205 C99 201 104 200.5 108 203.8 L114 201 C113 202.3 112.5 203.6 112.5 205 C112.5 206.4 113 207.7 114 209 L108 206.2 C104 209.5 99 209 96 205 Z" />
              </g>
              <g className="svg-swim" style={{ animationDelay: "0.9s" }}>
                <path d="M126 220 C129 216 134 215.5 138 218.8 L144 216 C143 217.3 142.5 218.6 142.5 220 C142.5 221.4 143 222.7 144 224 L138 221.2 C134 224.5 129 224 126 220 Z" />
              </g>
              <g className="svg-swim" style={{ animationDelay: "1.7s" }}>
                <path d="M104 236 C107 232 112 231.5 116 234.8 L122 232 C121 233.3 120.5 234.6 120.5 236 C120.5 237.4 121 238.7 122 240 L116 237.2 C112 240.5 107 240 104 236 Z" />
              </g>
            </g>
            {/* another pair near the destination — the reason the buoy is there */}
            <g fill="#0F8A5C" opacity="0.45">
              <g className="svg-swim" style={{ animationDelay: "0.4s" }}>
                <path d="M330 100 C333 96 338 95.5 342 98.8 L348 96 C347 97.3 346.5 98.6 346.5 100 C346.5 101.4 347 102.7 348 104 L342 101.2 C338 104.5 333 104 330 100 Z" />
              </g>
              <g className="svg-swim" style={{ animationDelay: "1.3s" }}>
                <path d="M352 116 C355 112 360 111.5 364 114.8 L370 112 C369 113.3 368.5 114.6 368.5 116 C368.5 117.4 369 118.7 370 120 L364 117.2 C360 120.5 355 120 352 116 Z" />
              </g>
            </g>
            {/* sea-surface symbols and soundings scattered on the water */}
            {[
              [40, 80], [120, 45], [330, 130], [70, 170], [250, 250], [380, 200],
            ].map(([x, y], i) => (
              <path
                key={i}
                d={`M${x} ${y} q4 -3.5 8 0 t8 0`}
                fill="none"
                stroke="#3461D9"
                strokeWidth="1.1"
                opacity="0.5"
                strokeLinecap="round"
              />
            ))}
            <text x="150" y="230" fontFamily="'Big Shoulders Variable',Impact,sans-serif" fontStyle="italic" fontSize="11" fill="#3461D9" opacity="0.65">27</text>
            <text x="300" y="90" fontFamily="'Big Shoulders Variable',Impact,sans-serif" fontStyle="italic" fontSize="11" fill="#3461D9" opacity="0.65">44</text>
            {/* hatched danger areas the course detours around */}
            <g>
              <rect x="150" y="95" width="105" height="62" fill="url(#hatch-critical)" stroke="#C81E36" strokeWidth="1.4" strokeDasharray="7 4" />
              <text x="202" y="130" textAnchor="middle" fontFamily="'JetBrains Mono Variable',monospace" fontSize="8.5" fill="#C81E36" letterSpacing="1.5">
                NO ENTRY
              </text>
              <rect x="265" y="180" width="80" height="50" fill="url(#hatch-warning)" stroke="#D1460E" strokeWidth="1.2" strokeDasharray="7 4" />
            </g>
            {/* direct track — the wrong answer */}
            <line x1="60" y1="252" x2="366" y2="60" stroke="#5C7189" strokeWidth="1.6" strokeDasharray="2 6" opacity="0.6" />
            {/* safest course — the answer, and it runs */}
            <path
              className="route-live"
              d="M60 252 C 105 240 120 205 138 178 C 155 152 130 120 160 84 C 185 55 260 40 320 46 C 342 48 356 52 366 60"
              fill="none"
              stroke="#0F8A5C"
              strokeWidth="3"
              strokeDasharray="11 8"
              strokeLinecap="round"
            />
            {/* boat, riding the swell */}
            <g transform="translate(60 252)">
              <g className="svg-bob">
                <circle r="22" fill="none" stroke="#3461D9" strokeWidth="1.4" opacity="0.5" />
                <circle r="15" fill="#0B2A4A" stroke="#FFFFFF" strokeWidth="2.5" />
                <path d="M0 -8 v8 M0 -6 l5.5 6 h-5.5 z" stroke="#FFFFFF" strokeWidth="1.6" fill="#FFFFFF" />
                <path d="M-6 4 q3 2.4 6 0 t6 0" stroke="#FFFFFF" strokeWidth="1.4" fill="none" />
              </g>
            </g>
            {/* destination buoy, hailing */}
            <g transform="translate(366 60)">
              <circle className="svg-ping" r="17" fill="none" stroke="#0F8A5C" strokeWidth="2" />
              <g className="svg-bob" style={{ animationDelay: "1.2s" }}>
                <circle r="17" fill="#FFFFFF" stroke="#0F8A5C" strokeWidth="4" />
                <text y="6" textAnchor="middle" fontFamily="'Big Shoulders Variable',Impact,sans-serif" fontWeight="800" fontSize="16" fill="#0B2A4A">
                  1
                </text>
              </g>
            </g>
            <text x="392" y="64" fontFamily="'Big Shoulders Variable',Impact,sans-serif" fontStyle="italic" fontWeight="600" fontSize="13" fill="#0F8A5C">
              82%
            </text>
            {/* compass */}
            <g transform="translate(400 250)" opacity="0.75">
              <circle r="24" fill="none" stroke="#0B2A4A" strokeWidth="1.3" />
              <g className="compass-needle">
                <path d="M0 -20 L5 6 L0 11 L-5 6 Z" fill="#0B2A4A" />
              </g>
              <text y="-27" textAnchor="middle" fontFamily="'JetBrains Mono Variable',monospace" fontSize="8" fill="#0B2A4A">
                N
              </text>
            </g>
            <text x="60" y="285" fontFamily="'JetBrains Mono Variable',monospace" fontSize="8.5" fill="#5C7189" letterSpacing="1.5">
              SAFEST ≠ SHORTEST · 5 KM LONGER · LEGAL
            </text>
          </svg>
        </Reveal>
      </div>

      {/* live stats strip */}
      <Reveal delay={420}>
        <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-[14px] bg-ink-900 sm:grid-cols-5">
          {stats.map((x, i) => (
            <div
              key={x.k}
              className={`px-5 py-4 ${i > 0 ? "border-l border-paper-50/10" : ""}`}
            >
              <div className="truncate text-[12.5px] font-bold text-ink-300">{x.k}</div>
              <div
                className={`mt-1.5 font-display text-[40px] font-extrabold tabular-nums leading-none ${
                  x.warn ? "text-flag" : "text-paper-50"
                }`}
              >
                {x.v}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* impact bar — Marine Fisheries Census 2016 numbers from SIH submission */}
      <Reveal delay={460}>
        <div className="mt-3 flex flex-wrap items-center gap-x-8 gap-y-1 px-1 py-2">
          <span className="shrink-0 text-[12.5px] font-bold text-ink-400">Target users · Marine Fisheries Census 2016</span>
          {[
            { v: "9,27,081", k: "active fishermen" },
            { v: "67.3%", k: "families below poverty line" },
            { v: "74.1%", k: "small / non-motorised craft" },
            { v: "535", k: "arrested by Sri Lanka in 2024" },
          ].map((s) => (
            <div key={s.k} className="flex items-baseline gap-1.5">
              <span className="font-display text-[24px] font-extrabold text-ink-900">{s.v}</span>
              <span className="text-[12.5px] text-ink-500">{s.k}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* three doors in — one board, a row per audience */}
      <Reveal delay={520}>
        <div className="panel mt-6 divide-y divide-paper-150 overflow-hidden">
          {t.cards.map((c, i) => (
            <div
              key={cardTabs[i]}
              className="grid gap-4 px-6 py-5 transition-colors hover:bg-paper-100 md:grid-cols-[minmax(220px,300px)_1fr_auto] md:items-center md:gap-8"
            >
              <div>
                <span className="label flex items-center gap-2">
                  {c.kicker}
                  {i === 0 && <FishGlyph size={15} className="swim text-chart-500" />}
                </span>
                <h3 className="mt-1 font-display text-[30px] font-extrabold leading-[1.05] text-ink-900">
                  {c.title}
                </h3>
              </div>
              <ul className="space-y-1.5">
                {c.lines.map((l) => (
                  <li key={l} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-700">
                    <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-chart-500" />
                    {l}
                  </li>
                ))}
              </ul>
              <button onClick={() => onEnter(cardTabs[i])} className="btn-line group/open justify-center">
                {t.openWord}{" "}
                <CourseArrow size={12} className="transition-transform group-hover/open:translate-x-1" />
              </button>
            </div>
          ))}
        </div>
      </Reveal>

      {/* how it decides — the differentiator */}
      <Reveal delay={880}>
        <div className="panel mt-5 overflow-hidden">
          <div className="hd">
            <span className="label">{t.pipelineTitle}</span>
            <button
              onClick={() => onEnter("system")}
              className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-chart-600 underline decoration-dashed underline-offset-4 transition-colors hover:text-ink-900"
            >
              {t.watchLive}
            </button>
          </div>
          <div className="grid sm:grid-cols-4">
            {t.phases.map((p, i) => (
              <div
                key={p.t}
                className={`group relative px-4 py-3.5 transition-colors hover:bg-chart-100/40 ${i > 0 ? "sm:border-l" : ""}`}
                style={{ borderColor: "var(--rule-faint)" }}
              >
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-[15px] font-bold text-ink-900">{p.t}</span>
                  {i === 1 && (
                    <span className="font-mono text-[9px] font-bold text-chart-700">∥ 5</span>
                  )}
                </div>
                <p className="mt-1 text-[11.5px] italic leading-snug text-ink-500">{p.n}</p>
                {i < 3 && (
                  <CourseArrow
                    size={13}
                    className="absolute -right-1.5 top-1/2 hidden -translate-y-1/2 text-ink-300 transition-all group-hover:translate-x-0.5 group-hover:text-chart-600 sm:block"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      {/* footer */}
      <Reveal delay={980}>
        <div className="mt-8 flex flex-wrap items-baseline justify-between gap-2 pb-4">
          <span className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-400">
            {t.footer}
          </span>
          <a
            href="https://github.com/madhavthesiya/orca-sih26176"
            target="_blank"
            rel="noreferrer"
            className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-chart-600 transition-colors hover:text-ink-900"
          >
            github.com/madhavthesiya/orca-sih26176
          </a>
        </div>
      </Reveal>
    </div>
  );
}
