import type { Language } from "./types";

/**
 * Every way a screen can fail, put into words a fisher can act on. Errors
 * say what happened and what to do next — never an apology, never a code.
 */
export type FailKind = "timeout" | "offline" | "server" | "crash";

export class ApiError extends Error {
  constructor(
    readonly kind: Exclude<FailKind, "crash">,
    detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

export function failKind(e: unknown): FailKind {
  return e instanceof ApiError ? e.kind : "crash";
}

const TEXT: Record<Language, Record<FailKind, { title: string; hint: string }>> = {
  en: {
    timeout: {
      title: "The sea data is taking too long.",
      hint: "The connection may be weak. Try again in a minute.",
    },
    offline: {
      title: "ORCA cannot reach its server.",
      hint: "Check the internet connection, then try again.",
    },
    server: {
      title: "The server could not answer this.",
      hint: "Try again. If it keeps happening, switch to the demo data.",
    },
    crash: {
      title: "This screen stopped working.",
      hint: "Reload the page. Your location and language are kept.",
    },
  },
  hi: {
    timeout: {
      title: "समुद्र की जानकारी आने में बहुत देर हो रही है।",
      hint: "नेटवर्क कमज़ोर हो सकता है। एक मिनट बाद फिर कोशिश करें।",
    },
    offline: {
      title: "ORCA अपने सर्वर तक नहीं पहुँच पा रहा।",
      hint: "इंटरनेट जाँचें, फिर दोबारा कोशिश करें।",
    },
    server: {
      title: "सर्वर इसका जवाब नहीं दे सका।",
      hint: "फिर कोशिश करें। बार-बार हो तो डेमो डेटा चुनें।",
    },
    crash: {
      title: "यह स्क्रीन रुक गई है।",
      hint: "पेज दोबारा खोलें। आपकी जगह और भाषा बनी रहेगी।",
    },
  },
  gu: {
    timeout: {
      title: "દરિયાની માહિતી આવવામાં બહુ વાર લાગે છે.",
      hint: "નેટવર્ક નબળું હોઈ શકે. એક મિનિટ પછી ફરી પ્રયાસ કરો.",
    },
    offline: {
      title: "ORCA તેના સર્વર સુધી પહોંચી શકતું નથી.",
      hint: "ઇન્ટરનેટ તપાસો, પછી ફરી પ્રયાસ કરો.",
    },
    server: {
      title: "સર્વર આનો જવાબ આપી શક્યું નથી.",
      hint: "ફરી પ્રયાસ કરો. વારંવાર થાય તો ડેમો ડેટા પસંદ કરો.",
    },
    crash: {
      title: "આ સ્ક્રીન અટકી ગઈ છે.",
      hint: "પેજ ફરી ખોલો. તમારું સ્થાન અને ભાષા જળવાઈ રહેશે.",
    },
  },
};

export function failureText(kind: FailKind, lang: Language) {
  return (TEXT[lang] ?? TEXT.en)[kind];
}

/** The page's current language, as the app last set it on <html lang>. */
export function pageLanguage(): Language {
  const l = typeof document !== "undefined" ? document.documentElement.lang : "en";
  return l === "hi" || l === "gu" ? l : "en";
}
