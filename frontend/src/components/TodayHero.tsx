import { tripIsOff } from "../today";
import type { FishingOutlook, Language, RiskCategory } from "../types";
import { kmh, metres } from "../units";
import { WarnGlyph } from "./glyphs";

const T: Record<Language, Record<string, string>> = {
  en: {
    near: "Today near",
    score: "risk score / 100",
    waves: "Waves",
    wind: "Wind",
    best: "Best time",
    back: "Be back by",
    grounds: "Fishing grounds",
    within: "within {r} km",
    warning: "Official warning in force",
    noTrip: "No trip today.",
    folded: "Grounds and times stay folded until the sea is safe.",
  },
  hi: {
    near: "आज, पास में",
    score: "जोखिम स्कोर / 100",
    waves: "लहरें",
    wind: "हवा",
    best: "सबसे अच्छा समय",
    back: "इससे पहले लौटें",
    grounds: "मछली की जगहें",
    within: "{r} किमी के भीतर",
    warning: "आधिकारिक चेतावनी लागू",
    noTrip: "आज कोई यात्रा नहीं।",
    folded: "समुद्र सुरक्षित होने तक जगहें और समय छिपे रहेंगे।",
  },
  gu: {
    near: "આજે, નજીક",
    score: "જોખમ સ્કોર / 100",
    waves: "મોજાં",
    wind: "પવન",
    best: "શ્રેષ્ઠ સમય",
    back: "આ પહેલાં પાછા આવો",
    grounds: "માછીમારીની જગ્યાઓ",
    within: "{r} કિમીની અંદર",
    warning: "સત્તાવાર ચેતવણી અમલમાં",
    noTrip: "આજે કોઈ સફર નહીં.",
    folded: "દરિયો સુરક્ષિત થાય ત્યાં સુધી જગ્યાઓ અને સમય છુપાવેલા રહેશે.",
  },
};

/**
 * Risk tints for a navy ground. The chart's status colours are tuned for
 * white and sink into navy; these lighter steps hold contrast there. The
 * category is always written out too, so colour is never the only signal.
 */
const ON_NAVY: Record<RiskCategory, string> = {
  LOW: "#3DDC97",
  MODERATE: "#FFC21A",
  HIGH: "#FF8A4C",
  EXTREME: "#FF6B7A",
  UNKNOWN: "#AFC0D3",
};

function hour(h: number): string {
  const x = ((h % 24) + 24) % 24;
  return `${x % 12 || 12} ${x < 12 ? "AM" : "PM"}`;
}

/**
 * The day's answer, first and full width: where you are, the verdict in
 * the reader's language, the score, and the five numbers a fisher weighs.
 */
export default function TodayHero({ data, language = "en" }: { data: FishingOutlook; language?: Language }) {
  const t = T[language] ?? T.en;
  const cat = data.safety.category;
  const tint = ON_NAVY[cat] ?? ON_NAVY.UNKNOWN;
  const off = tripIsOff(data);

  const stats = [
    { k: t.waves, v: metres(data.safety.wave_height_m), u: "m" },
    { k: t.wind, v: kmh(data.safety.wind_speed_kmh), u: "km/h" },
    {
      k: t.best,
      v: !off && data.best_window ? `${hour(data.best_window.from_hour)}–${hour(data.best_window.to_hour)}` : "—",
      u: "",
    },
    { k: t.back, v: !off && data.duration?.return_by ? data.duration.return_by : "—", u: "" },
    {
      k: t.grounds,
      v: off ? "—" : String(data.areas.length),
      u: off ? "" : t.within.replace("{r}", String(data.radius_km)),
    },
  ];

  return (
    <section
      aria-label={`${t.near} ${data.location.nearest_landing_centre}: ${cat}`}
      className="relative overflow-hidden rounded-[14px] bg-ink-900 text-paper-50"
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-2" style={{ background: tint }} />

      <div className="grid gap-6 py-6 pl-8 pr-6 lg:grid-cols-[1fr_auto] lg:items-end lg:pr-8">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-bold text-ink-300">
            <span>
              {t.near} {data.location.nearest_landing_centre}
            </span>
            <span className="rounded-full px-2.5 py-0.5 text-[12px] font-extrabold text-ink-900" style={{ background: tint }}>
              {cat}
            </span>
            {data.safety.official_warning && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#FF6B7A] px-2.5 py-0.5 text-[12px] font-extrabold text-ink-900">
                <WarnGlyph size={12} /> {t.warning}
              </span>
            )}
          </div>
          <h2 className="mt-3 max-w-[900px] font-display text-[clamp(30px,3.3vw,46px)] font-extrabold leading-[1.02] text-paper-50">
            {data.advice[0]}
          </h2>
          {off && (
            <p className="mt-3 text-[14.5px] font-bold text-flag">
              {t.noTrip} <span className="font-normal text-paper-50/80">{t.folded}</span>
            </p>
          )}
        </div>

        <div className="lg:text-right">
          <div className="font-display text-[96px] font-black leading-[0.8] tabular-nums" style={{ color: tint }}>
            {data.safety.score}
          </div>
          <div className="mt-2 text-[12.5px] font-bold text-ink-300">{t.score}</div>
        </div>
      </div>

      <dl className="grid grid-cols-2 border-t border-paper-50/10 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <div key={s.k} className={`px-6 py-4 ${i > 0 ? "lg:border-l lg:border-paper-50/10" : "pl-8"}`}>
            <dt className="truncate text-[12.5px] font-bold text-ink-300">{s.k}</dt>
            <dd className="mt-1 font-display text-[30px] font-extrabold leading-none tabular-nums text-paper-50">
              {s.v}
              {s.u && <span className="ml-1.5 font-sans text-[12.5px] font-bold text-ink-300">{s.u}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
