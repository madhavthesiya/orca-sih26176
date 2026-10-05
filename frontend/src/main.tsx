import React from "react";
import ReactDOM from "react-dom/client";
// Self-hosted fonts — the demo must not depend on a font CDN being reachable.
// Display: hull-registration lettering (opsz keeps small headings legible).
// Body: Overpass — Highway Gothic lineage, signage clarity at any size.
import "@fontsource-variable/big-shoulders/opsz.css";
import "@fontsource-variable/overpass";
import "@fontsource-variable/overpass/wght-italic.css";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/noto-sans-devanagari";
import App from "./App";
import MobileApp from "./components/MobileApp";
import "./index.css";

// Phone-sized screens get the fisher's own app — voice-first, symbol-first,
// three destinations. `?m=1` forces it (testing, the PWA start_url), `?m=0`
// forces the full console even on a small window.
const mParam = new URLSearchParams(window.location.search).get("m");
const isPhone =
  mParam === "1" || (mParam !== "0" && window.matchMedia("(max-width: 640px)").matches);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>{isPhone ? <MobileApp /> : <App />}</React.StrictMode>,
);
