import type { AgentTrace as Trace, Language } from "../types";

const LABEL: Record<Language, Record<string, string>> = {
  en: {
    intent: "Intent", weather: "Weather", ocean: "Ocean", pfz: "Fishing zones",
    cyclone: "Alerts", gis: "GIS", risk: "Risk engine", route: "Route",
    explanation: "Explanation",
  },
  hi: {
    intent: "आशय", weather: "मौसम", ocean: "समुद्र", pfz: "मत्स्य क्षेत्र",
    cyclone: "चेतावनियाँ", gis: "GIS", risk: "रिस्क इंजन", route: "मार्ग",
    explanation: "व्याख्या",
  },
  gu: {
    intent: "ઇરાદો", weather: "હવામાન", ocean: "સમુદ્ર", pfz: "માછીમારી ક્ષેત્રો",
    cyclone: "ચેતવણીઓ", gis: "GIS", risk: "રિસ્ક એન્જિન", route: "માર્ગ",
    explanation: "સ્પષ્ટીકરણ",
  },
};

/** What each agent does and what it reads — opened from its row in the trace. */
const ROLE: Record<Language, Record<string, string>> = {
  en: {
    intent: "Reads the question: which place, which hour, which language, and what is being asked.",
    weather: "Wind, gusts, rain and visibility for that place and hour, from the public forecast.",
    ocean: "Wave height, swell period, sea temperature and currents, from the marine forecast.",
    pfz: "Likely fishing grounds from chlorophyll, sea temperature and thermal fronts.",
    cyclone: "Official IMD / INCOIS warnings and storms near the coast. A warning always wins.",
    gis: "Closed areas, the maritime boundary and restricted zones around the position.",
    risk: "Weighs every reading into one 0–100 score. Safety floors can only raise it, never lower it.",
    route: "Plots the safest course around closed and dangerous water — not merely the shortest.",
    explanation: "Turns the decision into short, plain sentences in the reader's language, with sources.",
  },
  hi: {
    intent: "सवाल पढ़ता है: कौन-सी जगह, कौन-सा समय, कौन-सी भाषा, और क्या पूछा गया है।",
    weather: "उस जगह और समय के लिए हवा, झोंके, बारिश और दृश्यता — सार्वजनिक पूर्वानुमान से।",
    ocean: "लहरों की ऊँचाई, लहर-अवधि, समुद्र का तापमान और धाराएँ — समुद्री पूर्वानुमान से।",
    pfz: "क्लोरोफिल, समुद्री तापमान और थर्मल फ्रंट से मछली मिलने की संभावित जगहें।",
    cyclone: "IMD / INCOIS की आधिकारिक चेतावनियाँ और तट के पास तूफ़ान। चेतावनी हमेशा ऊपर रहती है।",
    gis: "स्थान के आसपास बंद इलाके, समुद्री सीमा और प्रतिबंधित क्षेत्र।",
    risk: "हर जानकारी को तौलकर 0–100 का एक स्कोर। सुरक्षा-सीमाएँ इसे सिर्फ़ बढ़ा सकती हैं, घटा नहीं सकतीं।",
    route: "बंद और ख़तरनाक पानी से बचकर सबसे सुरक्षित रास्ता — सिर्फ़ सबसे छोटा नहीं।",
    explanation: "फ़ैसले को पाठक की भाषा में छोटे, सरल वाक्यों में बदलता है, स्रोतों के साथ।",
  },
  gu: {
    intent: "પ્રશ્ન વાંચે છે: કઈ જગ્યા, કયો સમય, કઈ ભાષા, અને શું પૂછાયું છે.",
    weather: "તે જગ્યા અને સમય માટે પવન, ઝાપટાં, વરસાદ અને દૃશ્યતા — જાહેર આગાહી પરથી.",
    ocean: "મોજાંની ઊંચાઈ, મોજાંનો ગાળો, દરિયાનું તાપમાન અને પ્રવાહો — દરિયાઈ આગાહી પરથી.",
    pfz: "ક્લોરોફિલ, દરિયાના તાપમાન અને થર્મલ ફ્રન્ટ પરથી માછલી મળવાની સંભવિત જગ્યાઓ.",
    cyclone: "IMD / INCOIS ની સત્તાવાર ચેતવણીઓ અને કિનારા પાસેનાં તોફાન. ચેતવણી હંમેશા ઉપર રહે છે.",
    gis: "સ્થાનની આસપાસ બંધ વિસ્તારો, દરિયાઈ સરહદ અને પ્રતિબંધિત ઝોન.",
    risk: "દરેક માહિતી તોલીને 0–100 નો એક સ્કોર. સુરક્ષા-મર્યાદાઓ તેને ફક્ત વધારી શકે, ઘટાડી નહીં.",
    route: "બંધ અને જોખમી પાણીથી બચીને સૌથી સુરક્ષિત માર્ગ — ફક્ત સૌથી ટૂંકો નહીં.",
    explanation: "નિર્ણયને વાચકની ભાષામાં ટૂંકાં, સરળ વાક્યોમાં ફેરવે છે, સ્રોતો સાથે.",
  },
};

const T: Record<Language, Record<string, string>> = {
  en: {
    crew: "Agent crew",
    agents: "agents",
    total: "ms total",
    concurrent: "CONCURRENT",
    understand: "Understand", understandN: "parse the question",
    gather: "Gather", gatherN: "specialists run in parallel",
    decide: "Decide", decideN: "fuse evidence, plan",
    explain: "Explain", explainN: "answer in the user's language",
    note: "The planner decides which specialists a question needs and runs the independent ones concurrently. The risk engine waits for all of them — no agent's opinion can skip it.",
    openHint: "Open any agent to see what it does.",
  },
  hi: {
    crew: "एजेंट टीम",
    agents: "एजेंट",
    total: "ms कुल",
    concurrent: "एक साथ",
    understand: "समझो", understandN: "सवाल परखो",
    gather: "जुटाओ", gatherN: "विशेषज्ञ एक साथ चलते हैं",
    decide: "तय करो", decideN: "प्रमाण जोड़ो, योजना बनाओ",
    explain: "समझाओ", explainN: "उपयोगकर्ता की भाषा में जवाब",
    note: "प्लानर तय करता है कि किस सवाल के लिए कौन से विशेषज्ञ चाहिए और स्वतंत्र एजेंटों को एक साथ चलाता है। रिस्क इंजन सबका इंतज़ार करता है — कोई भी एजेंट इसे लाँघ नहीं सकता।",
    openHint: "किसी भी एजेंट को खोलकर देखें कि वह क्या करता है।",
  },
  gu: {
    crew: "એજન્ટ ટીમ",
    agents: "એજન્ટ",
    total: "ms કુલ",
    concurrent: "એકસાથે",
    understand: "સમજો", understandN: "પ્રશ્ન પારખો",
    gather: "ભેગું કરો", gatherN: "નિષ્ણાતો એકસાથે ચાલે છે",
    decide: "નક્કી કરો", decideN: "પુરાવા જોડો, યોજના બનાવો",
    explain: "સમજાવો", explainN: "વપરાશકર્તાની ભાષામાં જવાબ",
    note: "પ્લાનર નક્કી કરે છે કે કયા પ્રશ્ન માટે કયા નિષ્ણાત જોઈએ અને સ્વતંત્ર એજન્ટોને એકસાથે ચલાવે છે. રિસ્ક એન્જિન બધાની રાહ જુએ છે — કોઈપણ એજન્ટ તેને છોડી શકતો નથી.",
    openHint: "કોઈપણ એજન્ટ ખોલીને જુઓ કે તે શું કરે છે.",
  },
};

/** The graph, as it actually executes. */
const PHASES: { key: string; agents: string[] }[] = [
  { key: "understand", agents: ["intent"] },
  { key: "gather", agents: ["weather", "ocean", "pfz", "cyclone", "gis"] },
  { key: "decide", agents: ["risk", "route"] },
  { key: "explain", agents: ["explanation"] },
];

const STATUS_DOT: Record<Trace["status"], string> = {
  ok: "#0F8A5C",
  degraded: "#A86B00",
  failed: "#C81E36",
  skipped: "#8A9AAD",
};

/**
 * The crew manifest — the panel that proves ORCA is a crew rather than a
 * single prompt. Grouped by execution phase so the parallel fan-out is
 * visible, with real measured latencies, set like a ship's log.
 */
export default function AgentTracePanel({
  trace,
  elapsed,
  language = "en",
}: {
  trace: Trace[];
  elapsed?: number;
  language?: Language;
}) {
  if (!trace.length) return null;
  const t = T[language] ?? T.en;
  const labels = LABEL[language] ?? LABEL.en;
  const roles = ROLE[language] ?? ROLE.en;

  const byName = new Map(trace.map((x) => [x.agent, x]));
  const maxLatency = Math.max(...trace.map((x) => x.latency_ms), 1);
  const ran = PHASES.map((p) => ({
    ...p,
    title: t[p.key],
    note: t[`${p.key}N`],
    rows: p.agents.map((a) => byName.get(a)).filter(Boolean) as Trace[],
  })).filter((p) => p.rows.length);

  return (
    <div className="panel overflow-hidden">
      <div className="hd">
        <span className="label">{t.crew}</span>
        <span className="font-mono text-[10px] tabular-nums text-ink-400">
          {trace.length} {t.agents} · {elapsed ?? trace.reduce((s, x) => s + x.latency_ms, 0)}{" "}
          {t.total}
        </span>
      </div>

      <div className="space-y-3.5 px-4 py-3.5">
        {ran.map((phase) => (
          <div key={phase.key}>
            <div className="mb-1.5 flex items-baseline gap-2">
              <span className="font-display text-[13px] font-bold text-ink-900">{phase.title}</span>
              <span className="text-[10.5px] italic text-ink-400">{phase.note}</span>
              {phase.key === "gather" && phase.rows.length > 1 && (
                <span className="ml-auto border border-chart-500/50 bg-chart-100/50 px-2 py-0.5 font-mono text-[9px] font-bold tracking-wide text-chart-700">
                  ∥ {phase.rows.length} {t.concurrent}
                </span>
              )}
            </div>

            <div
              className={
                phase.key === "gather"
                  ? "space-y-1 border-l-2 border-chart-500/40 pl-2.5"
                  : "space-y-1"
              }
            >
              {phase.rows.map((row) => {
                return (
                  // Deliberately NOT per-row entrance-animated. A staggered
                  // animation with fill-mode:both leaves rows at opacity 0 if
                  // animations never run (hidden tab, reduced motion, some
                  // projectors) — and an invisible agent trace during a demo,
                  // or invisible safety data, is not an acceptable failure.
                  <details
                    key={row.agent}
                    className="group rounded-[6px] border bg-paper-100 px-2.5 py-1.5"
                    style={{
                      borderColor:
                        row.status === "ok" || row.status === "skipped"
                          ? "var(--rule-faint)"
                          : STATUS_DOT[row.status] + "66",
                    }}
                  >
                    <summary
                      title={roles[row.agent]}
                      className="flex cursor-pointer list-none items-center gap-2 text-[11.5px] [&::-webkit-details-marker]:hidden"
                    >
                      <span
                        className="h-2 w-2 shrink-0 rotate-45"
                        style={{ background: STATUS_DOT[row.status] }}
                      />
                      <span className="w-[96px] shrink-0 font-semibold text-ink-900">
                        {labels[row.agent] ?? row.agent}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink-500">
                        {row.summary || "—"}
                      </span>
                      <span className="shrink-0 font-mono text-[9.5px] tabular-nums text-ink-400">
                        {row.latency_ms}ms
                      </span>
                      <span
                        aria-hidden
                        className="shrink-0 text-[11px] text-ink-300 transition-transform group-open:rotate-90"
                      >
                        ▸
                      </span>
                    </summary>
                    {row.latency_ms > 0 && (
                      <div className="mt-1 h-[2px] overflow-hidden bg-ink-900/[0.07]">
                        <div
                          className="grow-x h-full bg-chart-500/70 transition-all duration-500"
                          style={{ width: `${(row.latency_ms / maxLatency) * 100}%` }}
                        />
                      </div>
                    )}
                    {roles[row.agent] && (
                      <p
                        className="mt-1.5 border-t pt-1.5 text-[12.5px] leading-snug text-ink-700"
                        style={{ borderColor: "var(--rule-faint)" }}
                      >
                        {roles[row.agent]}
                      </p>
                    )}
                  </details>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <p
        className="border-t px-4 py-2.5 text-[10.5px] italic leading-relaxed text-ink-400"
        style={{ borderColor: "var(--rule-faint)" }}
      >
        {t.note} {t.openHint}
      </p>
    </div>
  );
}
