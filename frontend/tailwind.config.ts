import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        ink: "var(--ink)",
        "ink-2": "var(--ink-2)",
        mute: "var(--mute)",
        dim: "var(--dim)",
        rule: "var(--rule)",
        leaf: "var(--leaf)",
        "leaf-deep": "var(--leaf-deep)",
        "leaf-tint": "var(--leaf-tint)",
        mint: "var(--mint)",
        "mint-tint": "var(--mint-tint)",
        solar: "var(--solar)",
        terracotta: "var(--terracotta)",
        "ink-blue": "var(--ink-blue)",
        crimson: "var(--crimson)",
      },
      fontFamily: {
        display: ["'Fraunces Variable'", "Fraunces", "Georgia", "serif"],
        sans: ["Mulish", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["'JetBrains Mono Variable'", "'JetBrains Mono'", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        "tightest-2": "-0.04em",
      },
      boxShadow: {
        sheet: "0 1px 0 0 var(--rule), 0 24px 60px -32px rgba(26,31,28,0.18)",
        rail: "1px 0 0 var(--rule)",
        tile: "0 1px 0 var(--rule)",
        soft: "0 8px 30px -12px rgba(26,31,28,0.12)",
        ringleaf: "0 0 0 2px var(--leaf-tint), 0 0 0 4px var(--leaf)",
      },
      keyframes: {
        riseIn: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        drawLine: {
          "0%": { strokeDashoffset: "200" },
          "100%": { strokeDashoffset: "0" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%": { opacity: "0.6", transform: "scale(1.04)" },
        },
      },
      animation: {
        riseIn: "riseIn 600ms cubic-bezier(0.16,1,0.3,1) both",
        drawLine: "drawLine 1200ms cubic-bezier(0.65,0,0.35,1) both",
        pulseSoft: "pulseSoft 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;
