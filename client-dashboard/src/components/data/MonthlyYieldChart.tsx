/* Monthly yield bar chart — pure SVG.
 * Bars in leaf gradient, mono labels, hairline baseline.
 * 1 row labels at base, 1 row tick numerals at top. */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function MonthlyYieldChart({
  data,
  height = 180,
}: {
  data: number[];
  height?: number;
}) {
  if (!data.length) {
    return (
      <div className="bg-surface rounded-2xl p-5 mono text-[11px] text-mute" style={{ border: "1px solid var(--rule)" }}>
        Awaiting yield simulation…
      </div>
    );
  }
  const max = Math.max(...data);
  const min = Math.min(...data);
  const totalKwh = data.reduce((s, n) => s + n, 0);
  const avg = totalKwh / data.length;

  const width = 540;
  const padX = 24;
  const padY = 28;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const barW = innerW / data.length - 6;

  return (
    <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between mb-3">
        <div>
          <h3 className="text-[13px] font-extrabold tracking-tight">Monthly yield · kWh</h3>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-mute mt-0.5">
            PVGIS TMY · Perez transposition · 50 °C cell derate
          </p>
        </div>
        <div className="text-right">
          <p className="numeral text-[22px] tab-num leading-none" style={{ fontWeight: 600 }}>
            {totalKwh.toLocaleString("en-MY")}
          </p>
          <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute">annual total</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <defs>
          <linearGradient id="barGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#5DB94D" />
            <stop offset="100%" stopColor="#3D8D2F" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0.25, 0.5, 0.75, 1].map((g, i) => {
          const y = padY + innerH * (1 - g);
          return (
            <g key={i}>
              <line
                x1={padX}
                x2={width - padX}
                y1={y}
                y2={y}
                stroke="var(--rule)"
                strokeWidth="0.5"
                strokeDasharray="2 4"
              />
              <text
                x={padX - 5}
                y={y + 3}
                textAnchor="end"
                fontSize="8"
                fontFamily="JetBrains Mono Variable, monospace"
                fill="var(--mute)"
              >
                {Math.round((max * g) / 1000) * 1000}
              </text>
            </g>
          );
        })}

        {/* Avg line */}
        <line
          x1={padX}
          x2={width - padX}
          y1={padY + innerH * (1 - avg / max)}
          y2={padY + innerH * (1 - avg / max)}
          stroke="var(--terracotta)"
          strokeWidth="0.8"
          strokeDasharray="3 3"
        />
        <text
          x={width - padX + 3}
          y={padY + innerH * (1 - avg / max) + 3}
          fontSize="7.5"
          fontFamily="JetBrains Mono Variable, monospace"
          fill="var(--terracotta)"
        >
          avg
        </text>

        {/* Bars */}
        {data.map((v, i) => {
          const x = padX + i * (innerW / data.length) + 3;
          const h = (v / max) * innerH;
          const y = padY + innerH - h;
          const isHigh = v === max;
          const isLow = v === min;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barW}
                height={h}
                rx={2}
                fill={isHigh ? "url(#barGrad)" : "var(--mint)"}
                stroke={isHigh ? "var(--leaf-deep)" : "var(--leaf)"}
                strokeWidth="0.6"
              />
              {isHigh && (
                <text
                  x={x + barW / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="JetBrains Mono Variable, monospace"
                  fill="var(--leaf-deep)"
                >
                  ▲
                </text>
              )}
              {isLow && (
                <text
                  x={x + barW / 2}
                  y={padY + innerH - 4}
                  textAnchor="middle"
                  fontSize="8"
                  fontFamily="JetBrains Mono Variable, monospace"
                  fill="var(--terracotta)"
                >
                  ▼
                </text>
              )}
              <text
                x={x + barW / 2}
                y={height - 6}
                textAnchor="middle"
                fontSize="9"
                fontFamily="JetBrains Mono Variable, monospace"
                fill="var(--mute)"
                letterSpacing="0.04em"
              >
                {MONTHS[i]}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
