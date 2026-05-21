interface Stat {
  label: string;
  value: string;
  unit: string;
  accent: string;
}

const STATS: Stat[] = [
  { label: "Simulated · since Q1'24", value: "412", unit: "MWp", accent: "var(--leaf-deep)" },
  { label: "Rooftops modelled", value: "1,847", unit: "sites", accent: "var(--ink)" },
  { label: "Annual savings designed", value: "RM 11.2", unit: "M", accent: "var(--leaf-deep)" },
  { label: "Yield accuracy", value: "94", unit: "% vs measured", accent: "var(--ink)" },
];

const TICKER_SITES = [
  "Sentul Warehouse 04",
  "USJ Logistics Hub",
  "Bangi Bio-Park",
  "Cyberjaya Data Centre 02",
  "Klang Coldstore",
  "Penang Cosmetics Plant",
  "Skudai Furniture Mill",
  "Bukit Jelutong CDC",
  "Ipoh Cement Silo 7",
  "Kuching Palm-oil Refinery",
  "Shah Alam Pharma 03",
  "Subang Polyclinic",
];

export default function StatBand() {
  return (
    <section
      style={{
        position: "relative",
        paddingTop: 30,
        paddingBottom: 30,
        background: "var(--surface)",
        borderTop: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
      }}
    >
      <div
        className="stat-band-grid"
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "0 32px",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 40,
          alignItems: "end",
        }}
      >
        {STATS.map((s, i) => (
          <div key={s.label} className="anim-rise" style={{ animationDelay: `${i * 80}ms` }}>
            <div
              className="mono"
              style={{
                fontSize: 9.5,
                color: "var(--mute)",
                textTransform: "uppercase",
                letterSpacing: "0.22em",
                marginBottom: 8,
              }}
            >
              {s.label}
            </div>
            <div className="flex items-baseline flex-wrap" style={{ gap: "4px 8px" }}>
              <span
                className="numeral tab-num"
                style={{ fontSize: 48, lineHeight: 0.95, color: s.accent, whiteSpace: "nowrap" }}
              >
                {s.value}
              </span>
              <span
                className="mono"
                style={{
                  fontSize: 11.5,
                  color: "var(--mute)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  paddingBottom: 6,
                  whiteSpace: "nowrap",
                }}
              >
                {s.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      <ProofTicker />
    </section>
  );
}

const ProofTicker = () => {
  const seq = [...TICKER_SITES, ...TICKER_SITES];
  return (
    <div
      style={{
        marginTop: 28,
        paddingTop: 22,
        borderTop: "1px dashed var(--rule)",
        overflow: "hidden",
        position: "relative",
        maxWidth: 1320,
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <div
        className="mono"
        style={{
          position: "absolute",
          left: 32,
          top: 22,
          fontSize: 9,
          color: "var(--mute)",
          textTransform: "uppercase",
          letterSpacing: "0.22em",
          background: "var(--surface)",
          paddingRight: 14,
          zIndex: 2,
        }}
      >
        Sites in pipeline ↓
      </div>
      <div className="ticker-track" style={{ paddingLeft: 180, gap: 32 }}>
        {seq.map((label, i) => (
          <span
            key={i}
            className="mono"
            style={{
              fontSize: 11.5,
              color: "var(--ink-2)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                background: "var(--leaf)",
                borderRadius: 1,
                transform: "rotate(45deg)",
              }}
            />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
