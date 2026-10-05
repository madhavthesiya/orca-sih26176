import { Component, type ReactNode } from "react";
import { failureText, pageLanguage } from "../failure";

/**
 * Last line of defence: a render error anywhere below shows a calm,
 * translated sheet with a way back, never a blank page.
 */
export default class CrashGuard extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ORCA screen failed:", error);
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const lang = pageLanguage();
    const f = failureText("crash", lang);
    return (
      <div role="alert" className="grid min-h-full place-items-center p-6">
        <div className="panel rule-double max-w-[440px] px-6 py-6">
          <h1 className="font-display text-[28px] font-extrabold leading-tight text-ink-900">{f.title}</h1>
          <p className="mt-2 text-[15px] leading-relaxed text-ink-700">{f.hint}</p>
          <button onClick={() => window.location.reload()} className="btn-ink mt-5">
            {lang === "gu" ? "ફરી ખોલો" : lang === "hi" ? "दोबारा खोलें" : "Reload"}
          </button>
        </div>
      </div>
    );
  }
}
