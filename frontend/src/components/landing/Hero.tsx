import { ArrowUpRight } from "@/icons";
import { SunPathGlyph, RinggitGlyph, DroneGlyph } from "@/icons/glyphs";
import RooftopPreview from "./RooftopPreview";

interface HeroProps {
  onTryClick: () => void;
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
        aria-hidden
        style={{
          position: "absolute",
          right: -120,
          top: 40,
          opacity: 0.6,
          pointerEvents: "none",
          width: 520,
          height: 320,
        }}
      >
        <svg width="520" height="320" viewBox="0 0 520 320">
          <defs>
            <pattern id="hero-hatch" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="var(--leaf)" strokeWidth="0.7" strokeOpacity="0.55" />
            </pattern>
          </defs>
          <path
            d="M 30 280 C 130 80, 260 80, 360 150 C 420 195, 460 160, 500 90"
            stroke="var(--leaf)"
            strokeWidth="1.2"
            fill="none"
            strokeDasharray="4 6"
          />
          <circle cx="500" cy="90" r="36" fill="url(#hero-hatch)" stroke="var(--leaf)" strokeWidth="1" />
          <circle cx="500" cy="90" r="10" fill="var(--solar)" />
        </svg>
      </div>

      <div
        className="hero-grid"
        style={{
          position: "relative",
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "1.05fr 1.15fr",
          gap: 52,
          alignItems: "center",
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
              Solar Layout Studio · for Malaysian EPCs
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
              Drone in.{" "}
              <span style={{ color: "var(--leaf-deep)" }}>Ringgit</span>{" "}
              <span className="display-soft" style={{ fontStyle: "italic" }}>
                out.
              </span>
              <br />
              The whole rooftop,
              <br />
              <span className="display-soft" style={{ fontStyle: "italic", color: "var(--ink)" }}>
                settled before tea.
              </span>
            </h1>

            <p
              style={{
                marginTop: 24,
                fontSize: 17,
                lineHeight: 1.55,
                color: "var(--ink-2)",
                maxWidth: "52ch",
                fontWeight: 500,
              }}
            >
              RexCharge turns drone footage into bankable rooftop solar designs in under{" "}
              <span className="link-dotted" style={{ fontWeight: 700, color: "var(--ink)" }}>
                six minutes
              </span>
              . PVGIS-grade yield. ATAP NEM 3.0 settlement. Built for installers from Sentul to Skudai.
            </p>

            <div className="flex items-center" style={{ gap: 14, marginTop: 32, flexWrap: "wrap" }}>
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
              <button
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "14px 20px",
                  borderRadius: 999,
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: "var(--ink-2)",
                  background: "transparent",
                  border: "1px solid var(--rule)",
                  whiteSpace: "nowrap",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5.5" stroke="currentColor" strokeWidth="1" />
                  <polygon points="4.5,3.5 8.5,6 4.5,8.5" fill="currentColor" />
                </svg>
                Watch the 90-sec tour
              </button>
            </div>

            <div
              className="flex items-center"
              style={{
                marginTop: 28,
                gap: 14,
                flexWrap: "wrap",
                fontSize: 11,
                color: "var(--mute)",
                fontFamily: "JetBrains Mono, monospace",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
              }}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <SunPathGlyph size={13} style={{ color: "var(--solar)" }} />
                PVGIS TMY · Perez POA
              </span>
              <span style={{ color: "var(--dim)" }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <RinggitGlyph size={12} style={{ color: "var(--leaf-deep)" }} />
                ATAP NEM 3.0 · ringgit/kWh
              </span>
              <span style={{ color: "var(--dim)" }}>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <DroneGlyph size={12} style={{ color: "var(--ink-2)" }} />
                DJI · OBJ · MP4
              </span>
            </div>
          </div>
        </div>

        <div className="anim-rise" style={{ animationDelay: "180ms" }}>
          <RooftopPreview />
        </div>
      </div>
    </section>
  );
}
