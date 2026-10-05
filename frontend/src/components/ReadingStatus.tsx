import { failureText, type FailKind } from "../failure";
import { minutesSince, type ReadingState } from "../today";
import type { Language } from "../types";
import { WarnGlyph } from "./glyphs";

const T: Record<Language, { aged: string; failed: string; refresh: string }> = {
  en: {
    aged: "Not live — this reading is {n} min old.",
    failed: "Could not refresh — showing the reading from {t}.",
    refresh: "Refresh",
  },
  hi: {
    aged: "लाइव नहीं — यह जानकारी {n} मिनट पुरानी है।",
    failed: "ताज़ा नहीं हो सका — {t} की जानकारी दिखा रहे हैं।",
    refresh: "ताज़ा करें",
  },
  gu: {
    aged: "લાઇવ નથી — આ માહિતી {n} મિનિટ જૂની છે.",
    failed: "તાજું થઈ શક્યું નહીં — {t} ની માહિતી બતાવીએ છીએ.",
    refresh: "તાજું કરો",
  },
};

const LOCALE: Record<Language, string> = { en: "en-IN", hi: "hi-IN", gu: "gu-IN" };

/**
 * The honesty strip above a reading. "ready" and "loading" draw nothing;
 * "stale" keeps the reading but says how old it is; "error" (nothing to show)
 * explains the failure and offers a retry.
 */
export default function ReadingStatus({
  state,
  failed,
  failure,
  generatedAt,
  language,
  now,
  onRefresh,
}: {
  state: ReadingState;
  failed: boolean;
  failure: FailKind | null;
  generatedAt: string | null;
  language: Language;
  now: number;
  onRefresh: () => void;
}) {
  const t = T[language] ?? T.en;
  const button = (
    <button
      onClick={onRefresh}
      className="ml-auto shrink-0 text-[13.5px] font-bold text-chart-600 underline decoration-2 underline-offset-4"
    >
      {t.refresh}
    </button>
  );

  if (state === "error") {
    const f = failureText(failure ?? "offline", language);
    return (
      <div role="alert" className="panel hatch-danger flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3.5">
        <WarnGlyph size={16} className="shrink-0 text-risk-extreme" />
        <span className="text-[14px] font-bold text-risk-extreme">{f.title}</span>
        <span className="text-[13.5px] text-ink-700">{f.hint}</span>
        {button}
      </div>
    );
  }

  if (state !== "stale") return null;
  const at = generatedAt
    ? new Date(generatedAt).toLocaleTimeString(LOCALE[language], { hour: "2-digit", minute: "2-digit" })
    : "—";
  const text = failed
    ? t.failed.replace("{t}", at)
    : t.aged.replace("{n}", String(minutesSince(generatedAt, now) ?? "—"));
  return (
    <div
      role="status"
      className="flex items-center gap-3 rounded-[12px] border-[1.5px] border-dashed border-risk-moderate bg-flag/15 px-4 py-2.5"
    >
      <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-risk-moderate" aria-hidden />
      <span className="text-[13.5px] font-bold text-ink-900">{text}</span>
      {button}
    </div>
  );
}
