import type { ComponentType, CSSProperties, ReactNode } from "react";
import { DroneGlyph, MeshImportGlyph, SunPathGlyph, RinggitGlyph } from "@/icons/glyphs";

interface Feature {
  key: string;
  eyebrow: string;
  title: string;
  desc: string;
  Icon: ComponentType<{ size?: number; style?: CSSProperties }>;
  accent: string;
  detail: ReactNode;
}

const FEATURES: Feature[] = [
  {
    key: "drone",
    eyebrow: "01 · Capture",
    title: "Multi-angle imagery. Not one overhead shot.",
    desc: "8 to 12 geotagged photos from a drone orbital pass at 15-25 m altitude. Single overhead images can't recover obstacle height, roof pitch, or true plane orientation — so we don't pretend they can.",
    Icon: DroneGlyph,
    accent: "var(--ink-blue)",
    detail: <DroneDetail />,
  },
  {
    key: "model",
    eyebrow: "02 · Reconstruct",
    title: "SfM-grounded 3D, with AI densification.",
    desc: "Structure-from-motion carries the geometry, in-house AI mesh model densifies the surface. RANSAC plane fitting extracts per-plane tilt, azimuth, and obstacle height. Parapets, water tanks, HVAC units — all measured, not guessed.",
    Icon: MeshImportGlyph,
    accent: "var(--leaf-deep)",
    detail: <ModelDetail />,
  },
  {
    key: "yield",
    eyebrow: "03 · Yield",
    title: "Meteonorm TMY. 8,760 hours.",
    desc: "Hourly DNI + DHI on the site coordinates, cross-validated against NASA POWER. 3D ray-traced shading from extracted obstacles. Explicit loss stack: temperature, soiling, inverter, wiring, mismatch — PR derived, not assumed.",
    Icon: SunPathGlyph,
    accent: "var(--solar)",
    detail: <YieldDetail />,
  },
  {
    key: "roi",
    eyebrow: "04 · Settle",
    title: "TNB tariff engine. Marginal-tier rates.",
    desc: "Domestik or Komersial, NEM 3.0 sell-back toggle. Marginal-tier kWh pricing surfaces the displacement value most tools flatten away. Same site, two configurations on one screen, the tariff consequence in ringgit.",
    Icon: RinggitGlyph,
    accent: "var(--leaf-deep)",
    detail: <RoiDetail />,
  },
];

export default function Features() {
  return (
    <section style={{ paddingTop: 96, paddingBottom: 80, position: "relative" }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 32px" }}>
        <div className="flex items-end justify-between" style={{ marginBottom: 48, gap: 32, flexWrap: "wrap" }}>
          <div style={{ maxWidth: 640 }}>
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
              The studio
            </div>
            <h2
              className="numeral"
              style={{
                fontSize: "clamp(36px, 3.6vw, 56px)",
                lineHeight: 1,
                letterSpacing: "-0.03em",
                color: "var(--ink)",
                margin: 0,
              }}
            >
              Multi-angle photos to{" "}
              <span className="display-soft" style={{ fontStyle: "italic" }}>
                auditable proposal,
              </span>
              <br />
              in one pipeline.
            </h2>
          </div>
          <p style={{ maxWidth: "44ch", fontSize: 14.5, color: "var(--mute)", lineHeight: 1.55 }}>
            No image-generation hallucinations. No fragmented AutoCAD + PVsyst hand-off. Geometry from
            structure-from-motion, yield from explicit formulas — built for the determinism that
            procurement and finance actually need.
          </p>
        </div>

        <div
          className="features-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: 1,
            background: "var(--rule)",
            border: "1px solid var(--rule)",
            borderRadius: 20,
            overflow: "hidden",
          }}
        >
          {FEATURES.map(({ key, ...f }) => (
            <FeatureCard key={key} {...f} />
          ))}
        </div>
      </div>
    </section>
  );
}

const FeatureCard = ({ eyebrow, title, Icon, desc, accent, detail }: Omit<Feature, "key">) => (
  <article
    className="lift"
    style={{
      background: "var(--surface)",
      padding: "32px 32px 28px",
      display: "flex",
      flexDirection: "column",
      gap: 18,
      position: "relative",
      overflow: "hidden",
    }}
  >
    <header className="flex items-start justify-between" style={{ gap: 18 }}>
      <div>
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: "0.22em",
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </div>
        <h3
          className="numeral"
          style={{
            fontSize: 28,
            lineHeight: 1.05,
            letterSpacing: "-0.025em",
            color: "var(--ink)",
            margin: 0,
            maxWidth: "20ch",
          }}
        >
          {title}
        </h3>
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          border: "1px solid var(--rule)",
          background: "var(--paper)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent,
          flexShrink: 0,
        }}
      >
        <Icon size={22} />
      </div>
    </header>

    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--ink-2)", margin: 0, maxWidth: "52ch" }}>{desc}</p>

    <div
      style={{
        marginTop: 8,
        padding: 16,
        background: "var(--paper)",
        border: "1px dashed var(--rule)",
        borderRadius: 12,
        minHeight: 120,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {detail}
    </div>
  </article>
);

function DroneDetail() {
  return (
    <svg viewBox="0 0 320 100" width="100%" height="100" style={{ display: "block" }}>
      <rect x="40" y="60" width="240" height="30" fill="none" stroke="var(--rule)" strokeWidth="1" strokeDasharray="2 3" />
      <path
        d="M 50 20 L 270 20 L 270 32 L 50 32 L 50 44 L 270 44 L 270 56 L 50 56"
        fill="none"
        stroke="var(--ink-blue)"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <g transform="translate(212, 56)">
        <circle cx="0" cy="0" r="5.5" fill="var(--surface)" stroke="var(--ink-blue)" strokeWidth="1.2" />
        <circle cx="0" cy="0" r="1.6" fill="var(--ink-blue)" />
        <line x1="-9" y1="0" x2="-5" y2="0" stroke="var(--ink-blue)" strokeWidth="1.2" />
        <line x1="9" y1="0" x2="5" y2="0" stroke="var(--ink-blue)" strokeWidth="1.2" />
        <line x1="0" y1="-9" x2="0" y2="-5" stroke="var(--ink-blue)" strokeWidth="1.2" />
        <line x1="0" y1="9" x2="0" y2="5" stroke="var(--ink-blue)" strokeWidth="1.2" />
      </g>
      <text x="50" y="14" fontSize="8" fontFamily="JetBrains Mono" fill="var(--ink-2)" letterSpacing="1">
        ORBITAL · 8-12 GEOTAGGED IMAGES
      </text>
      <text x="280" y="78" fontSize="8" fontFamily="JetBrains Mono" fill="var(--mute)" textAnchor="end" letterSpacing="1">
        RUNTIME · 10 MIN
      </text>
    </svg>
  );
}

function ModelDetail() {
  return (
    <svg viewBox="0 0 320 100" width="100%" height="100" style={{ display: "block" }}>
      <polygon points="30,75 90,40 240,40 280,55 280,80 220,90 60,90" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1" />
      <polygon points="30,75 90,40 240,40 220,75" fill="var(--mint-tint)" stroke="var(--leaf-deep)" strokeWidth="1" />
      <rect x="180" y="50" width="22" height="14" fill="none" stroke="var(--terracotta)" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="180" y1="50" x2="202" y2="64" stroke="var(--terracotta)" strokeWidth="0.6" />
      <line x1="202" y1="50" x2="180" y2="64" stroke="var(--terracotta)" strokeWidth="0.6" />
      <line x1="92" y1="32" x2="238" y2="32" stroke="var(--mute)" strokeWidth="0.6" strokeDasharray="2 2" />
      <text x="165" y="28" textAnchor="middle" fontSize="7.5" fontFamily="JetBrains Mono" fill="var(--mute)" letterSpacing="0.8">
        72.4 m
      </text>
      {[
        [30, 75],
        [90, 40],
        [240, 40],
        [280, 55],
        [220, 75],
        [60, 90],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2" fill="var(--leaf-deep)" />
      ))}
    </svg>
  );
}

function YieldDetail() {
  const months = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
  const data = [3400, 3500, 3850, 3700, 3550, 3400, 3500, 3650, 3600, 3500, 3300, 3250];
  const max = 4000;
  const w = 320;
  const h = 100;
  const pad = 8;
  const bw = (w - pad * 2) / data.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="100" style={{ display: "block" }}>
      {data.map((v, i) => {
        const bh = (v / max) * (h - 26);
        return (
          <g key={i}>
            <rect x={pad + i * bw + 2} y={h - 16 - bh} width={bw - 4} height={bh} fill="var(--leaf)" opacity="0.55" rx="1.5" />
            <text
              x={pad + i * bw + bw / 2}
              y={h - 4}
              fontSize="7"
              fontFamily="JetBrains Mono"
              fill="var(--mute)"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              {months[i]}
            </text>
          </g>
        );
      })}
      <path
        d={data
          .map((v, i) => {
            const x = pad + i * bw + bw / 2;
            const y = h - 16 - (v / max) * (h - 26);
            return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
          })
          .join(" ")}
        fill="none"
        stroke="var(--leaf-deep)"
        strokeWidth="1.4"
      />
      <text x={w - pad} y="12" fontSize="7.5" fontFamily="JetBrains Mono" fill="var(--ink-2)" textAnchor="end" letterSpacing="1">
        SPECIFIC YIELD · 1,398 kWh/kWp/yr
      </text>
    </svg>
  );
}

function RoiDetail() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, width: "100%" }}>
      <RoiBlock label="Capex · kWp" value="RM 3,800" />
      <RoiBlock label="Payback" value="6.3 yrs" accent />
      <RoiBlock label="PR" value="85.5%" accent />
      <div style={{ gridColumn: "1 / -1", marginTop: 2 }}>
        <div
          className="mono"
          style={{
            fontSize: 9,
            color: "var(--mute)",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            marginBottom: 6,
          }}
        >
          Load-matched vs Max-fit · 6.3 / 21.6 yr
        </div>
        <div style={{ height: 8, borderRadius: 999, background: "var(--surface-3)", overflow: "hidden", display: "flex" }}>
          <div style={{ width: "62%", background: "var(--leaf)" }} />
          <div style={{ width: "38%", background: "var(--solar)" }} />
        </div>
      </div>
    </div>
  );
}

const RoiBlock = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div>
    <div
      className="mono"
      style={{
        fontSize: 8.5,
        color: "var(--mute)",
        textTransform: "uppercase",
        letterSpacing: "0.18em",
        marginBottom: 2,
      }}
    >
      {label}
    </div>
    <div className="numeral tab-num" style={{ fontSize: 18, color: accent ? "var(--leaf-deep)" : "var(--ink)" }}>
      {value}
    </div>
  </div>
);
