/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // "Signal flags & hull lettering": sea-spray surfaces, navy ink,
        // code-flag cobalt, and buoy yellow — the colours a boat talks in.
        paper: {
          50: "#FFFFFF",
          100: "#EEF2F5",
          150: "#E3E9EE",
          200: "#D5DDE4",
          300: "#BAC6D1",
          400: "#8C9BAA",
        },
        ink: {
          900: "#0B2A4A",
          800: "#13355A",
          700: "#22476E",
          500: "#3F5A78",
          400: "#5C7189",
          300: "#8A9AAD",
        },
        chart: {
          700: "#1A3C9E",
          600: "#2148BF",
          500: "#3461D9",
          300: "#93AEEB",
          100: "#E1E9FB",
        },
        signal: "#C81E36",
        flag: "#FFC21A",
        risk: {
          low: "#0F8A5C",
          moderate: "#A86B00",
          high: "#D1460E",
          extreme: "#C81E36",
        },
      },
      fontFamily: {
        display: [
          '"Big Shoulders Variable"',
          '"Noto Sans Devanagari Variable"',
          '"Nirmala UI"',
          "Impact",
          "sans-serif",
        ],
        sans: [
          '"Atkinson Hyperlegible Next Variable"',
          '"Noto Sans Devanagari Variable"',
          '"Nirmala UI"',
          "system-ui",
          "sans-serif",
        ],
        mono: ['"JetBrains Mono Variable"', '"Nirmala UI"', "Consolas", "monospace"],
      },
      // Transform-only entrances, deliberately: an animation that starts at
      // opacity 0 with fill-mode both leaves content INVISIBLE if animations
      // never run (hidden tab, some projectors) — and these carry safety data.
      keyframes: {
        rise: {
          "0%": { transform: "translateY(8px)" },
          "100%": { transform: "translateY(0)" },
        },
        stampIn: {
          "0%": { transform: "scale(1.3) rotate(-5deg)" },
          "60%": { transform: "scale(0.96) rotate(-1.4deg)" },
          "100%": { transform: "scale(1) rotate(-2deg)" },
        },
      },
      animation: {
        rise: "rise .35s ease-out both",
        stampIn: "stampIn .45s cubic-bezier(.2,.9,.3,1.2) both",
      },
    },
  },
  plugins: [],
};
