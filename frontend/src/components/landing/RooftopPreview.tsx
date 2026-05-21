import { useEffect, useMemo, useState } from "react";

interface Params {
  kwp: number;
  panels: number;
  eta: number;
  soiling: number;
  derate: number;
}

interface SunSample {
  ghi: number;
  poa: number;
  tCell: number;
  instPowerKw: number;
  normSunY: number;
}

function sampleSun(t: number, params: Params): SunSample {
  const { kwp, eta, soiling, derate } = params;
  const ang = t * Math.PI;
  const elev = Math.sin(ang);
  if (elev <= 0) return { ghi: 0, poa: 0, tCell: 28, instPowerKw: 0, normSunY: 1 };
  const ghi = 1080 * Math.pow(elev, 1.05);
  const poa = ghi * (0.92 + 0.16 * Math.sin(ang - 0.3));
  const tAmb = 27 + 7 * Math.pow(elev, 0.8);
  const tCell = tAmb + (poa / 1000) * 25;
  const tempDerate = 1 - 0.0035 * (tCell - 25);
  const instPowerKw = (poa / 1000) * kwp * eta * soiling * tempDerate * derate;
  return { ghi, poa, tCell, instPowerKw, normSunY: 1 - elev };
}

function dailyKwh(params: Params): number {
  const N = 24 * 4;
  let total = 0;
  let prev = sampleSun(0, params).instPowerKw;
  for (let i = 1; i <= N; i++) {
    const cur = sampleSun(i / N, params).instPowerKw;
    total += ((prev + cur) / 2) * (12 / N);
    prev = cur;
  }
  return total;
}

export default function RooftopPreview() {
  const [t, setT] = useState(0.55);
  const [playing, setPlaying] = useState(false);

  const params = useMemo<Params>(
    () => ({ kwp: 29.76, panels: 48, eta: 0.986, soiling: 0.97, derate: 0.94 }),
    [],
  );

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      setT((prev) => {
        let next = prev + dt * 0.06;
        if (next > 1) next = 0;
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const { poa, tCell, instPowerKw } = sampleSun(t, params);
  const dKwh = useMemo(() => dailyKwh(params), [params]);
  const dailySaveRm = dKwh * 0.435;
  const annualKwh = dKwh * 365;
  const annualSaveRm = dailySaveRm * 365;

  const hour = 6 + t * 12;
  const hh = Math.floor(hour);
  const mm = Math.floor((hour - hh) * 60);
  const timeLabel = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  const ampm = hh < 12 ? "AM" : "PM";

  const arcAng = t * Math.PI;
  const elev = Math.max(0, Math.sin(arcAng));
  const panelTint = `hsl(210 ${28 + 14 * elev}% ${20 + 22 * (1 - elev)}%)`;
  const panelHighlight = `hsl(45 ${70 * elev}% ${50 + 35 * elev}% / ${0.55 + 0.4 * elev})`;

  return (
    <div
      style={{
        position: "relative",
        background: "var(--surface)",
        border: "1px solid var(--rule)",
        borderRadius: 20,
        boxShadow: "0 24px 60px -34px rgba(26,31,28,0.22)",
        overflow: "hidden",
      }}
    >
      <div
        className="flex items-center"
        style={{
          padding: "10px 14px",
          borderBottom: "1px solid var(--rule)",
          gap: 14,
          background: "var(--surface-2)",
        }}
      >
        <div className="flex items-center" style={{ gap: 6 }}>
          <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--terracotta)", opacity: 0.65 }} />
          <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--solar)", opacity: 0.65 }} />
          <span style={{ width: 9, height: 9, borderRadius: 999, background: "var(--leaf)", opacity: 0.65 }} />
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--mute)", letterSpacing: "0.16em", textTransform: "uppercase" }}>
          studio.rexcharge.my / projects / sentul-warehouse-04 / analysis
        </div>
        <div style={{ flex: 1 }} />
        <span
          className="mono"
          style={{
            fontSize: 9.5,
            color: "var(--leaf-deep)",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 999,
              background: "var(--leaf)",
              boxShadow: "0 0 0 3px var(--leaf-tint)",
            }}
          />
          live · pvgis tmy
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", minHeight: 480 }}>
        <div className="bg-blueprint" style={{ position: "relative", borderRight: "1px solid var(--rule)", overflow: "hidden" }}>
          <RooftopSVG t={t} panelTint={panelTint} panelHighlight={panelHighlight} />

          <div
            className="mono"
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              fontSize: 9.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "var(--ink-2)",
              background: "rgba(255,255,255,0.7)",
              border: "1px solid var(--rule)",
              padding: "4px 8px",
              borderRadius: 4,
              backdropFilter: "blur(6px)",
            }}
          >
            3.214° N · 101.701° E · 64m AGL
          </div>

          <div
            style={{
              position: "absolute",
              top: 14,
              right: 14,
              width: 38,
              height: 38,
              borderRadius: 999,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid var(--rule)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(6px)",
            }}
          >
            <svg width="22" height="22" viewBox="0 0 22 22">
              <circle cx="11" cy="11" r="9.5" fill="none" stroke="var(--ink-2)" strokeWidth="0.6" strokeDasharray="2 2" />
              <polygon points="11,2 13,11 11,20 9,11" fill="var(--ink)" />
              <text x="11" y="2.5" textAnchor="middle" fontSize="4.5" fontFamily="Mulish" fontWeight={700} fill="var(--ink)">
                N
              </text>
            </svg>
          </div>

          <div
            style={{
              position: "absolute",
              left: 14,
              right: 14,
              bottom: 14,
              background: "rgba(255,255,255,0.85)",
              border: "1px solid var(--rule)",
              borderRadius: 12,
              padding: "10px 12px",
              backdropFilter: "blur(8px)",
            }}
          >
            <div className="flex items-center" style={{ gap: 10, marginBottom: 6 }}>
              <button
                onClick={() => setPlaying((p) => !p)}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  background: "var(--ink)",
                  color: "var(--paper)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
                aria-label={playing ? "Pause sun path" : "Play sun path"}
              >
                {playing ? (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <rect x="1.5" y="1" width="2.4" height="8" fill="currentColor" />
                    <rect x="6.1" y="1" width="2.4" height="8" fill="currentColor" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10">
                    <polygon points="2,1 9,5 2,9" fill="currentColor" />
                  </svg>
                )}
              </button>
              <div className="mono" style={{ fontSize: 10, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.16em" }}>
                Sun path · {timeLabel}
                <span style={{ marginLeft: 6, color: "var(--ink-2)" }}>{ampm}</span>
              </div>
              <div style={{ flex: 1 }} />
              <div className="mono tab-num" style={{ fontSize: 10, color: "var(--ink-2)" }}>
                irradiance · <strong style={{ color: "var(--ink)" }}>{Math.round(poa)}</strong> W/m²
              </div>
            </div>
            <div style={{ position: "relative", height: 38 }}>
              <svg viewBox="0 0 100 40" width="100%" height="40" preserveAspectRatio="none" style={{ display: "block" }}>
                <path
                  d="M 4 38 Q 50 -6 96 38"
                  stroke="var(--rule)"
                  strokeWidth="0.6"
                  strokeDasharray="2 2"
                  fill="none"
                  vectorEffect="non-scaling-stroke"
                />
                <line x1="4" y1="38" x2="96" y2="38" stroke="var(--rule)" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
                {[0, 0.25, 0.5, 0.75, 1].map((u) => (
                  <line
                    key={u}
                    x1={4 + u * 92}
                    y1="36"
                    x2={4 + u * 92}
                    y2="40"
                    stroke="var(--rule)"
                    strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
                <circle
                  cx={4 + ((1 - Math.cos(arcAng)) / 2) * 92}
                  cy={38 - 36 * Math.sin(arcAng)}
                  r="6"
                  fill="var(--solar)"
                  opacity="0.25"
                />
              </svg>
              <input
                type="range"
                min={0}
                max={1}
                step={0.001}
                value={t}
                onChange={(e) => {
                  setPlaying(false);
                  setT(Number(e.target.value));
                }}
                className="sun-slider"
                style={{ position: "absolute", inset: 0, height: "100%" }}
                aria-label="Sun-path scrubber"
              />
            </div>
          </div>
        </div>

        <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 18 }}>
          <div className="flex items-baseline justify-between">
            <div>
              <div
                className="mono"
                style={{
                  fontSize: 9.5,
                  color: "var(--leaf-deep)",
                  textTransform: "uppercase",
                  letterSpacing: "0.22em",
                  marginBottom: 4,
                }}
              >
                Live system telemetry
              </div>
              <div style={{ fontSize: 13.5, fontWeight: 800, color: "var(--ink)", letterSpacing: "-0.01em" }}>
                Sentul Warehouse 04
              </div>
            </div>
            <span
              className="mono"
              style={{
                fontSize: 9.5,
                background: "var(--leaf-tint)",
                color: "var(--leaf-deep)",
                textTransform: "uppercase",
                letterSpacing: "0.16em",
                padding: "3px 7px",
                borderRadius: 4,
              }}
            >
              Ready
            </span>
          </div>

          <div
            style={{
              background: "var(--surface-2)",
              border: "1px solid var(--rule)",
              borderRadius: 12,
              padding: "16px 16px 14px",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div className="flex items-baseline justify-between">
              <span className="mono" style={{ fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.16em" }}>
                Instant power
              </span>
              <span className="mono" style={{ fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                of {params.kwp} kWp
              </span>
            </div>
            <div className="flex items-baseline" style={{ gap: 8, marginTop: 6 }}>
              <span className="numeral tab-num" style={{ fontSize: 56, lineHeight: 0.95, color: "var(--ink)" }}>
                {instPowerKw.toFixed(1)}
              </span>
              <span className="mono" style={{ fontSize: 12, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
                kW
              </span>
            </div>
            <div style={{ height: 4, background: "var(--rule)", borderRadius: 999, marginTop: 10, overflow: "hidden" }}>
              <div
                style={{
                  width: `${Math.min(100, (instPowerKw / params.kwp) * 100)}%`,
                  height: "100%",
                  background: "var(--leaf)",
                  transition: "width 80ms linear",
                }}
              />
            </div>
            <div
              className="flex items-center justify-between mono"
              style={{ marginTop: 6, fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.14em" }}
            >
              <span>cell · {tCell.toFixed(0)}°C</span>
              <span>poa · {Math.round(poa)} W/m²</span>
              <span>η · 98.6%</span>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <StatBlock label="Today · yield" value={dKwh.toFixed(0)} unit="kWh" accent="var(--leaf-deep)" />
            <StatBlock label="Today · saved" value={`RM ${Math.round(dailySaveRm)}`} unit="" accent="var(--leaf-deep)" />
            <StatBlock label="Annual · yield" value={(annualKwh / 1000).toFixed(1)} unit="MWh" />
            <StatBlock label="Annual · saved" value={`RM ${(annualSaveRm / 1000).toFixed(1)}k`} unit="" />
          </div>

          <DayCurve t={t} params={params} />

          <div
            className="mono"
            style={{
              fontSize: 9.5,
              color: "var(--mute)",
              textTransform: "uppercase",
              letterSpacing: "0.16em",
              borderTop: "1px solid var(--rule)",
              paddingTop: 10,
            }}
          >
            {params.panels} × Trina Vertex N 620W · 14° tilt · 178° azimuth
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatBlockProps {
  label: string;
  value: string;
  unit: string;
  accent?: string;
}

const StatBlock = ({ label, value, unit, accent }: StatBlockProps) => (
  <div style={{ background: "var(--surface)", border: "1px solid var(--rule)", borderRadius: 10, padding: "10px 12px" }}>
    <div
      className="mono"
      style={{ fontSize: 9, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.18em", marginBottom: 2 }}
    >
      {label}
    </div>
    <div className="flex items-baseline" style={{ gap: 4 }}>
      <span className="numeral tab-num" style={{ fontSize: 22, lineHeight: 1, color: accent || "var(--ink)" }}>
        {value}
      </span>
      {unit && (
        <span className="mono" style={{ fontSize: 10, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.14em" }}>
          {unit}
        </span>
      )}
    </div>
  </div>
);

const DayCurve = ({ t, params }: { t: number; params: Params }) => {
  const N = 96;
  const points = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i <= N; i++) {
      arr.push(sampleSun(i / N, params).instPowerKw);
    }
    return arr;
  }, [params]);

  const maxKw = Math.max(...points, 1);
  const w = 280;
  const h = 60;
  const pad = 4;

  const path = points
    .map((v, i) => {
      const x = pad + (i / N) * (w - 2 * pad);
      const y = h - pad - (v / maxKw) * (h - 2 * pad);
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  const fillPath = `${path} L ${w - pad} ${h - pad} L ${pad} ${h - pad} Z`;

  const curIdx = Math.round(t * N);
  const cx = pad + (curIdx / N) * (w - 2 * pad);
  const cy = h - pad - (points[curIdx] / maxKw) * (h - 2 * pad);

  return (
    <div>
      <div className="flex items-baseline justify-between" style={{ marginBottom: 6 }}>
        <span className="mono" style={{ fontSize: 9.5, color: "var(--mute)", textTransform: "uppercase", letterSpacing: "0.16em" }}>
          Power curve · today
        </span>
        <span className="mono tab-num" style={{ fontSize: 9.5, color: "var(--ink-2)" }}>
          peak {maxKw.toFixed(1)} kW · 12:32
        </span>
      </div>
      <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: "block" }}>
        <defs>
          <linearGradient id="curveFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--leaf)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--leaf)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--rule)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
        <line
          x1={w / 2}
          y1={pad}
          x2={w / 2}
          y2={h - pad}
          stroke="var(--rule)"
          strokeWidth="0.6"
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
        <path d={fillPath} fill="url(#curveFill)" />
        <path d={path} fill="none" stroke="var(--leaf-deep)" strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
        <line
          x1={cx}
          y1={pad}
          x2={cx}
          y2={h - pad}
          stroke="var(--ink)"
          strokeWidth="0.6"
          strokeDasharray="2 2"
          vectorEffect="non-scaling-stroke"
        />
        <circle cx={cx} cy={cy} r="3.5" fill="var(--solar)" stroke="var(--ink)" strokeWidth="1" />
      </svg>
    </div>
  );
};

interface RooftopSVGProps {
  t: number;
  panelTint: string;
  panelHighlight: string;
}

const RooftopSVG = ({ t, panelTint, panelHighlight }: RooftopSVGProps) => {
  const arcAng = t * Math.PI;
  const sunVecX = Math.cos(arcAng - Math.PI / 2);
  const sunVecY = Math.max(0.12, Math.sin(arcAng));
  const shadowLen = 8 / sunVecY;
  const dx = sunVecX * shadowLen;
  const dy = shadowLen * 0.4;

  const rows = 4;
  const cols = 12;
  const px = 70;
  const py = 130;
  const pw = 32;
  const ph = 18;
  const gapX = 4;
  const gapY = 4;

  return (
    <svg viewBox="0 0 520 460" width="100%" height="100%" preserveAspectRatio="xMidYMid meet" style={{ display: "block" }}>
      <defs>
        <pattern id="hatch-roof" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(-30)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--rule)" strokeWidth="0.5" />
        </pattern>
        <pattern id="hatch-warn" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="var(--terracotta)" strokeWidth="1" strokeOpacity="0.65" />
        </pattern>
      </defs>

      <g>
        <polygon points="40,360 90,290 480,290 430,360" fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth="1.2" />
        <polygon points="60,300 100,240 460,240 420,300" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="1.2" />
        <polygon points="60,300 100,240 460,240 420,300" fill="url(#hatch-roof)" />
      </g>

      <g stroke="var(--mute)" strokeWidth="0.6" fill="none" strokeDasharray="2 2">
        <path d="M 60 220 L 100 220" />
        <path d="M 100 220 L 460 220" />
        <path d="M 80 222 L 80 240" />
        <path d="M 280 222 L 280 240" />
      </g>
      <text x="280" y="216" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--ink-2)" letterSpacing="1.5">
        72.4 m
      </text>

      <g>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const x = px + c * (pw + gapX);
            const y = py + r * (ph + gapY);
            return (
              <polygon
                key={`s-${r}-${c}`}
                points={`${x + dx},${y + dy} ${x + pw + dx},${y + dy} ${x + pw + dx},${y + ph + dy} ${x + dx},${y + ph + dy}`}
                fill="rgba(26,31,28,0.22)"
                opacity={Math.min(0.6, 0.2 + (1 - sunVecY) * 0.8)}
              />
            );
          }),
        )}
      </g>

      <g>
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const x = px + c * (pw + gapX);
            const y = py + r * (ph + gapY);
            return (
              <g key={`p-${r}-${c}`}>
                <rect x={x} y={y} width={pw} height={ph} fill={panelTint} stroke="var(--ink)" strokeWidth="0.6" rx="1" />
                <rect x={x} y={y} width={pw} height={ph} fill={panelHighlight} opacity="0.65" rx="1" />
                <line x1={x + pw / 3} y1={y} x2={x + pw / 3} y2={y + ph} stroke="var(--ink)" strokeOpacity="0.3" strokeWidth="0.4" />
                <line
                  x1={x + (2 * pw) / 3}
                  y1={y}
                  x2={x + (2 * pw) / 3}
                  y2={y + ph}
                  stroke="var(--ink)"
                  strokeOpacity="0.3"
                  strokeWidth="0.4"
                />
                <line x1={x} y1={y + ph / 2} x2={x + pw} y2={y + ph / 2} stroke="var(--ink)" strokeOpacity="0.3" strokeWidth="0.4" />
              </g>
            );
          }),
        )}
      </g>

      <g>
        <rect x="420" y="252" width="22" height="22" fill="url(#hatch-warn)" stroke="var(--terracotta)" strokeWidth="0.8" />
        <text x="431" y="287" textAnchor="middle" fontSize="6.5" fontFamily="JetBrains Mono" fill="var(--terracotta)" letterSpacing="1">
          VENT
        </text>
        <ellipse cx="500" cy="262" rx="14" ry="5" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="0.8" />
        <rect x="486" y="262" width="28" height="20" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="0.8" />
        <ellipse cx="500" cy="282" rx="14" ry="4" fill="var(--surface-2)" stroke="var(--ink-2)" strokeWidth="0.8" />
      </g>

      <g stroke="var(--leaf-deep)" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.7">
        <path d="M70 130 L70 220 L40 230" strokeDasharray="3 2" />
        <path d="M450 130 L460 220 L490 220" strokeDasharray="3 2" />
      </g>

      <g>
        <rect x="20" y="226" width="22" height="14" fill="var(--surface)" stroke="var(--ink-2)" strokeWidth="0.8" />
        <text x="31" y="236" textAnchor="middle" fontSize="6.5" fontFamily="JetBrains Mono" fill="var(--ink-2)" letterSpacing="0.5">
          INV
        </text>
        <path d="M 42 233 L 60 230" stroke="var(--ink-2)" strokeWidth="0.6" strokeDasharray="2 2" fill="none" />
      </g>

      <g transform="translate(40,52)">
        <text x="60" y="6" fontSize="8" fontFamily="JetBrains Mono" fill="var(--ink-2)" letterSpacing="1.5">
          SCALE 1:240
        </text>
        <line x1="60" y1="14" x2="120" y2="14" stroke="var(--ink-2)" strokeWidth="0.8" />
        <line x1="60" y1="10" x2="60" y2="18" stroke="var(--ink-2)" strokeWidth="0.8" />
        <line x1="90" y1="11" x2="90" y2="17" stroke="var(--ink-2)" strokeWidth="0.8" />
        <line x1="120" y1="10" x2="120" y2="18" stroke="var(--ink-2)" strokeWidth="0.8" />
        <text x="60" y="28" fontSize="6.5" fontFamily="JetBrains Mono" fill="var(--mute)">
          0
        </text>
        <text x="120" y="28" fontSize="6.5" fontFamily="JetBrains Mono" fill="var(--mute)">
          10 m
        </text>
      </g>

      <g>
        <text x="280" y="430" textAnchor="middle" fontSize="9" fontFamily="JetBrains Mono" fill="var(--ink-2)" letterSpacing="1.5">
          48 × 620Wp · 29.76 kWp · azimuth 178°
        </text>
      </g>
    </svg>
  );
};
