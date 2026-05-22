import type { ComponentType } from "react";
import { DroneGlyph, PanelGlyph, RinggitGlyph } from "@/icons/glyphs";

interface Step {
  n: string;
  title: string;
  desc: string;
  time: string;
  Icon: ComponentType<{ size?: number }>;
  tag: string;
}

const STEPS: Step[] = [
  {
    n: "01",
    title: "Orbit the roof.",
    desc: "Drone orbital at 15-25 m altitude. 8-12 geotagged photos, multi-angle. Upload, walk away.",
    time: "5 min",
    Icon: DroneGlyph,
    tag: "Capture",
  },
  {
    n: "02",
    title: "Reconstruct, then optimise.",
    desc: "SfM grounds the geometry. AI densifies the mesh. RANSAC extracts planes with tilt + azimuth + obstacle height. The placer searches under-200 configurations per plane and picks the max-fit.",
    time: "10 min",
    Icon: PanelGlyph,
    tag: "Reconstruct",
  },
  {
    n: "03",
    title: "Settle in ringgit.",
    desc: "Meteonorm TMY yield, explicit PR stack, TNB tariff engine with marginal-tier kWh. Same site, two configurations — load-matched and max-fit — on one screen.",
    time: "25 min",
    Icon: RinggitGlyph,
    tag: "Settle",
  },
];

export default function HowItWorks() {
  return (
    <section
      style={{
        paddingTop: 80,
        paddingBottom: 96,
        background: "var(--surface)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: -80,
          bottom: -60,
          width: 320,
          height: 240,
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <svg width="320" height="240" viewBox="0 0 320 240">
          <defs>
            <pattern id="hwh" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
              <line x1="0" y1="0" x2="0" y2="8" stroke="var(--leaf)" strokeWidth="0.7" strokeOpacity="0.4" />
            </pattern>
          </defs>
          <circle cx="80" cy="160" r="80" fill="url(#hwh)" />
        </svg>
      </div>

      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px", position: "relative" }}>
        <div className="flex items-end justify-between" style={{ marginBottom: 56, gap: 32, flexWrap: "wrap" }}>
          <div>
            <div
              className="mono"
              style={{
                fontSize: 10.5,
                color: "var(--leaf-deep)",
                textTransform: "uppercase",
                letterSpacing: "0.28em",
                marginBottom: 14,
              }}
            >
              The flow · capture → settle
            </div>
            <h2
              className="numeral"
              style={{
                fontSize: "clamp(36px, 3.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                margin: 0,
                maxWidth: 720,
              }}
            >
              Three steps,{" "}
              <span className="display-soft" style={{ fontStyle: "italic" }}>
                forty minutes,
              </span>{" "}
              one pipeline.
            </h2>
          </div>
          <div
            className="mono"
            style={{
              fontSize: 10.5,
              color: "var(--mute)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              padding: "10px 14px",
              border: "1px dashed var(--rule)",
              borderRadius: 999,
              alignSelf: "end",
            }}
          >
            ↘ vs 2.5-4.5 h of senior engineer time
          </div>
        </div>

        <div style={{ position: "relative" }}>
          <svg
            aria-hidden
            viewBox="0 0 1000 80"
            preserveAspectRatio="none"
            width="100%"
            height="80"
            className="how-connector"
            style={{ position: "absolute", top: 64, left: 0, right: 0, pointerEvents: "none", zIndex: 0 }}
          >
            <path
              d="M 90 40 C 280 -10, 380 80, 510 40 C 660 0, 760 70, 920 40"
              stroke="var(--leaf-deep)"
              strokeWidth="1.4"
              strokeDasharray="3 5"
              fill="none"
              strokeLinecap="round"
            />
            <polygon points="920,40 912,35 912,45" fill="var(--leaf-deep)" />
          </svg>

          <div
            className="how-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 24,
              position: "relative",
              zIndex: 1,
            }}
          >
            {STEPS.map((s, i) => (
              <StepCard key={s.n} {...s} index={i} />
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 56,
            paddingTop: 22,
            borderTop: "1px solid var(--rule)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <p style={{ fontSize: 14, color: "var(--ink-2)", maxWidth: "60ch", lineHeight: 1.55, margin: 0 }}>
            Every output traces back to a formula, not a model checkpoint.{" "}
            <span className="link-dotted" style={{ color: "var(--ink)", fontWeight: 700 }}>
              Scaled mesh
            </span>{" "}
            for the engineer.{" "}
            <span className="link-dotted" style={{ color: "var(--ink)", fontWeight: 700 }}>
              Explicit PR stack
            </span>{" "}
            for the financier.{" "}
            <span className="link-dotted" style={{ color: "var(--ink)", fontWeight: 700 }}>
              TNB tariff engine
            </span>{" "}
            for the client.
          </p>
          <div
            className="mono"
            style={{
              fontSize: 10.5,
              color: "var(--leaf-deep)",
              textTransform: "uppercase",
              letterSpacing: "0.22em",
            }}
          >
            SfM · Meteonorm TMY · TNB tariff · NEM 3.0
          </div>
        </div>
      </div>
    </section>
  );
}

const StepCard = ({ n, title, desc, time, Icon, tag, index }: Step & { index: number }) => (
  <article
    className="anim-rise lift"
    style={{
      background: "var(--paper)",
      border: "1px solid var(--rule)",
      borderRadius: 16,
      padding: "26px 26px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 16,
      animationDelay: `${index * 140}ms`,
      position: "relative",
    }}
  >
    <header className="flex items-start justify-between">
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 14,
          background: "var(--surface)",
          border: "1px solid var(--rule)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--leaf-deep)",
          position: "relative",
        }}
      >
        <Icon size={26} />
        <div
          className="mono"
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            background: "var(--ink)",
            color: "var(--paper)",
            fontSize: 9.5,
            padding: "3px 6px",
            borderRadius: 999,
            letterSpacing: "0.1em",
            fontWeight: 600,
          }}
        >
          {n}
        </div>
      </div>
      <span
        className="mono"
        style={{
          fontSize: 9.5,
          color: "var(--mute)",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
        }}
      >
        {tag}
      </span>
    </header>

    <h3
      className="numeral"
      style={{
        fontSize: 30,
        lineHeight: 1,
        letterSpacing: "-0.025em",
        color: "var(--ink)",
        margin: 0,
      }}
    >
      {title}
    </h3>

    <p style={{ fontSize: 13.5, color: "var(--ink-2)", lineHeight: 1.6, margin: 0, maxWidth: "44ch" }}>{desc}</p>

    <footer
      className="flex items-center justify-between"
      style={{ marginTop: "auto", paddingTop: 14, borderTop: "1px dashed var(--rule)" }}
    >
      <span
        className="mono"
        style={{ fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.18em" }}
      >
        elapsed
      </span>
      <span className="numeral tab-num" style={{ fontSize: 22, color: "var(--leaf-deep)" }}>
        {time}
      </span>
    </footer>
  </article>
);
