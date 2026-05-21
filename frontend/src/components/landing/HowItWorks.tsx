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
    title: "Fly the roof.",
    desc: "15 minutes with a Mavic 3E. Nadir grid plus 5-direction obliques. Upload the .ZIP, walk away.",
    time: "15 min",
    Icon: DroneGlyph,
    tag: "Capture",
  },
  {
    n: "02",
    title: "Lay it out.",
    desc: "The studio auto-finds roof planes, vents, parapets. Drop panels by string. Swap inverters. Watch the kWh recalc as you draw.",
    time: "6 min",
    Icon: PanelGlyph,
    tag: "Design",
  },
  {
    n: "03",
    title: "Quote in ringgit.",
    desc: "ATAP NEM 3.0 sell-back. Payback, IRR, NPV — all live. Export bankable PDF, hand to the client over teh tarik.",
    time: "2 min",
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
              The flow · drone → ringgit
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
                twenty-three minutes,
              </span>{" "}
              one tab.
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
            ↘ measured on a typical 30 kWp warehouse
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
            Every output is a real artefact, not a screenshot.{" "}
            <span className="link-dotted" style={{ color: "var(--ink)", fontWeight: 700 }}>
              CAD-clean DXF
            </span>{" "}
            for the engineer.{" "}
            <span className="link-dotted" style={{ color: "var(--ink)", fontWeight: 700 }}>
              Bankable XLSX
            </span>{" "}
            for the financier.{" "}
            <span className="link-dotted" style={{ color: "var(--ink)", fontWeight: 700 }}>
              Proposal PDF
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
            DXF · XLSX · PDF · ATAP-ready forms
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
