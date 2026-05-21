import { ArrowUpRight } from "@/icons";
import Wordmark from "./Wordmark";

interface ClosingProps {
  onTryClick: () => void;
}

export default function Closing({ onTryClick }: ClosingProps) {
  return (
    <>
      <DarkCTA onTryClick={onTryClick} />
      <Footer />
    </>
  );
}

const DarkCTA = ({ onTryClick }: { onTryClick: () => void }) => (
  <section
    style={{
      background: "var(--ink)",
      color: "var(--paper)",
      paddingTop: 96,
      paddingBottom: 96,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <div
      aria-hidden
      style={{
        position: "absolute",
        right: -120,
        top: 60,
        width: 600,
        height: 400,
        opacity: 0.5,
        pointerEvents: "none",
      }}
    >
      <svg width="600" height="400" viewBox="0 0 600 400">
        <defs>
          <pattern id="dark-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
            <line x1="0" y1="0" x2="0" y2="10" stroke="var(--leaf)" strokeWidth="0.7" strokeOpacity="0.6" />
          </pattern>
        </defs>
        <path
          d="M 40 360 C 140 100, 360 60, 580 160"
          stroke="var(--leaf)"
          strokeWidth="1"
          fill="none"
          strokeDasharray="4 6"
          opacity="0.9"
        />
        <circle cx="580" cy="160" r="60" fill="url(#dark-hatch)" stroke="var(--leaf)" strokeWidth="0.8" />
        <circle cx="580" cy="160" r="18" fill="var(--solar)" />
      </svg>
    </div>

    <div
      className="closing-grid"
      style={{
        maxWidth: 1320,
        margin: "0 auto",
        padding: "0 32px",
        position: "relative",
        display: "grid",
        gridTemplateColumns: "1.6fr 1fr",
        gap: 60,
        alignItems: "center",
      }}
    >
      <div>
        <div
          className="mono"
          style={{
            fontSize: 10.5,
            color: "var(--leaf)",
            textTransform: "uppercase",
            letterSpacing: "0.28em",
            marginBottom: 22,
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <span
            className="anim-pulse"
            style={{ width: 6, height: 6, borderRadius: 999, background: "var(--leaf)" }}
          />
          Early access · cohort 03 closing Friday
        </div>
        <h2
          className="numeral"
          style={{
            fontSize: "clamp(48px, 5.4vw, 88px)",
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
            margin: 0,
            color: "var(--paper)",
          }}
        >
          Stop quoting in spreadsheets.
          <br />
          <span className="display-soft" style={{ fontStyle: "italic", color: "var(--leaf)" }}>
            Start settling in ringgit.
          </span>
        </h2>
        <p
          style={{
            marginTop: 22,
            fontSize: 16,
            color: "color-mix(in srgb, var(--paper) 75%, transparent)",
            lineHeight: 1.55,
            maxWidth: "52ch",
          }}
        >
          We onboard six new EPCs per quarter. Bring three real projects, walk out with three real proposals on day one.
        </p>

        <div className="flex items-center" style={{ gap: 14, marginTop: 32, flexWrap: "wrap" }}>
          <button
            onClick={onTryClick}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              background: "var(--leaf)",
              color: "var(--ink)",
              padding: "16px 24px",
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 800,
              letterSpacing: "-0.005em",
              whiteSpace: "nowrap",
              boxShadow: "0 1px 0 rgba(255,255,255,0.4) inset, 0 12px 36px -10px rgba(93,185,77,0.6)",
              transition: "transform 160ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-2px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            Try the studio
            <ArrowUpRight size={14} weight="bold" />
          </button>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              padding: "16px 22px",
              borderRadius: 999,
              fontSize: 13.5,
              fontWeight: 700,
              color: "var(--paper)",
              background: "transparent",
              border: "1px solid color-mix(in srgb, var(--paper) 30%, transparent)",
              whiteSpace: "nowrap",
            }}
          >
            Book a 20-min walkthrough
          </button>
        </div>

        <div
          className="flex items-center"
          style={{
            marginTop: 30,
            gap: 22,
            flexWrap: "wrap",
            fontSize: 11,
            color: "color-mix(in srgb, var(--paper) 60%, transparent)",
            fontFamily: "JetBrains Mono, monospace",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
          }}
        >
          <span>Free for your first 3 projects</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>No card, no AutoCAD seat needed</span>
          <span style={{ opacity: 0.4 }}>·</span>
          <span>BM &amp; EN support</span>
        </div>
      </div>

      <div
        style={{
          background: "color-mix(in srgb, var(--paper) 8%, var(--ink))",
          border: "1px solid color-mix(in srgb, var(--paper) 16%, transparent)",
          borderRadius: 16,
          padding: 24,
          position: "relative",
        }}
      >
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: "var(--leaf)",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            marginBottom: 12,
          }}
        >
          From cohort 02
        </div>
        <blockquote
          className="display-soft"
          style={{
            fontStyle: "italic",
            fontSize: 22,
            lineHeight: 1.25,
            color: "var(--paper)",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          “We used to lose two days a quote. Now we close before lunch. Last month we shipped seventeen.”
        </blockquote>
        <div
          className="hairline"
          style={{ background: "color-mix(in srgb, var(--paper) 16%, transparent)", margin: "20px 0" }}
        />
        <div className="flex items-baseline justify-between">
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, color: "var(--paper)" }}>Aiman binti Hashim</div>
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                color: "color-mix(in srgb, var(--paper) 55%, transparent)",
                textTransform: "uppercase",
                letterSpacing: "0.18em",
                marginTop: 2,
              }}
            >
              Director · Suria Atap Sdn Bhd
            </div>
          </div>
          <div className="numeral tab-num" style={{ fontSize: 28, color: "var(--leaf)", lineHeight: 1 }}>
            17×
          </div>
        </div>
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer style={{ padding: "30px 32px 40px", borderTop: "1px solid var(--rule)", background: "var(--paper)" }}>
    <div
      style={{
        maxWidth: 1320,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        gap: 24,
        flexWrap: "wrap",
      }}
      className="mono"
    >
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap" }}>
        <Wordmark compact />
        <span
          style={{
            fontSize: 10,
            color: "var(--mute)",
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            paddingLeft: 12,
            borderLeft: "1px solid var(--rule)",
          }}
        >
          Solar Layout Studio · v1.0
        </span>
      </div>
      <div
        style={{
          fontSize: 10,
          color: "var(--mute)",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          display: "flex",
          gap: 18,
          flexWrap: "wrap",
        }}
      >
        <span>PVGIS TMY · ATAP NEM 3.0</span>
        <span>Recharge Xolutions Sdn Bhd</span>
        <span>Kuala Lumpur · Selangor</span>
      </div>
    </div>
  </footer>
);
