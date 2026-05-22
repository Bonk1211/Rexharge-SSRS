import { useEffect, useState } from "react";
import { ArrowUpRight } from "@/icons";

interface HeroProps {
  onTryClick: () => void;
}

const PHRASES = [
  "reconstructed in 3D.",
  "measured, not estimated.",
  "reproducible every run.",
  "auditable end to end.",
];

function Typewriter({ phrases }: { phrases: string[] }) {
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "erasing">("typing");

  useEffect(() => {
    const current = phrases[index];
    if (phase === "typing") {
      if (text.length < current.length) {
        const t = window.setTimeout(() => setText(current.slice(0, text.length + 1)), 55);
        return () => window.clearTimeout(t);
      }
      const t = window.setTimeout(() => setPhase("holding"), 1600);
      return () => window.clearTimeout(t);
    }
    if (phase === "holding") {
      const t = window.setTimeout(() => setPhase("erasing"), 400);
      return () => window.clearTimeout(t);
    }
    if (phase === "erasing") {
      if (text.length > 0) {
        const t = window.setTimeout(() => setText(text.slice(0, -1)), 28);
        return () => window.clearTimeout(t);
      }
      setIndex((i) => (i + 1) % phrases.length);
      setPhase("typing");
    }
  }, [text, phase, index, phrases]);

  return (
    <span
      className="display-soft"
      style={{ fontStyle: "italic", color: "var(--ink)", whiteSpace: "pre" }}
    >
      {text}
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: "0.06em",
          marginLeft: "0.05em",
          height: "0.85em",
          background: "var(--leaf-deep)",
          verticalAlign: "-0.08em",
          animation: "hero-caret-blink 900ms steps(2,start) infinite",
        }}
      />
      <style>{`@keyframes hero-caret-blink { 50% { opacity: 0; } }`}</style>
    </span>
  );
}

export default function Hero({ onTryClick }: HeroProps) {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: 56,
        paddingBottom: 60,
        overflow: "hidden",
      }}
    >
      <div
        className="hero-grid"
        style={{
          position: "relative",
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 52,
          alignItems: "center",
          justifyItems: "center",
          textAlign: "center",
        }}
      >
        <div>
          <div className="anim-rise" style={{ animationDelay: "60ms" }}>
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                color: "var(--leaf-deep)",
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                marginBottom: 18,
                display: "inline-flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--leaf)",
                  boxShadow: "0 0 0 4px var(--leaf-tint)",
                }}
              />
              SfM-Grounded Solar Layout
            </div>

            <h1
              className="numeral"
              style={{
                fontSize: "clamp(48px, 5.6vw, 84px)",
                lineHeight: 0.94,
                letterSpacing: "-0.035em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              No more hallucinated layouts.
              <br />
              <Typewriter phrases={PHRASES} />
            </h1>

            <p
              style={{
                marginTop: 24,
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--ink-2)",
                maxWidth: "52ch",
                marginLeft: "auto",
                marginRight: "auto",
                fontWeight: 500,
              }}
            >
              Multi-angle imagery to bankable rooftop design in 10 minutes residential, 15 minutes commercial.
              Structure-from-motion geometry, Meteonorm TMY yield, TNB tariff engine — every number traceable to a formula.
            </p>

            <div className="flex items-center" style={{ gap: 14, marginTop: 32, justifyContent: "center" }}>
              <button
                onClick={onTryClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  padding: "14px 22px",
                  borderRadius: 999,
                  fontSize: 14,
                  fontWeight: 800,
                  letterSpacing: "-0.005em",
                  whiteSpace: "nowrap",
                  boxShadow: "0 1px 0 rgba(255,255,255,0.18) inset, 0 12px 32px -14px rgba(26,31,28,0.55)",
                  transition: "transform 160ms ease, box-shadow 160ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Try the studio
                <ArrowUpRight size={14} weight="bold" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
