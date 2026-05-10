import { IrradianceGlyph } from "@/icons";

/* Schematic Malaysia map showing pinned project locations + a base
 * irradiance heat tint. Pure SVG. Approximates Peninsular + East Malaysia silhouette
 * with rounded blob paths — not GIS-accurate, but recognizable. */

const sites = [
  { id: "kl", x: 198, y: 188, label: "KL" },
  { id: "pj", x: 192, y: 186, label: "PJ" },
  { id: "shah-alam", x: 184, y: 188, label: "SA" },
  { id: "cyberjaya", x: 200, y: 198, label: "Cyber" },
  { id: "ipoh", x: 184, y: 156, label: "Ipoh" },
  { id: "penang", x: 158, y: 130, label: "Pg" },
];

export default function IrradianceMap() {
  return (
    <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-center gap-2">
          <IrradianceGlyph size={14} className="text-leaf-deep" />
          <h3 className="text-[13px] font-extrabold tracking-tight">Portfolio · irradiance map</h3>
        </div>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">PVGIS TMY · 2024</span>
      </div>

      <svg viewBox="0 0 360 240" className="w-full h-auto">
        <defs>
          <linearGradient id="irr-gradient" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--solar)" stopOpacity="0.18" />
            <stop offset="50%" stopColor="var(--leaf)" stopOpacity="0.16" />
            <stop offset="100%" stopColor="var(--mint)" stopOpacity="0.18" />
          </linearGradient>
          <pattern id="dots-bg" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.6" fill="var(--rule)" />
          </pattern>
        </defs>

        <rect width="360" height="240" fill="url(#dots-bg)" />

        {/* Peninsula approximation */}
        <path
          d="M 150 70
             C 165 70, 185 90, 192 110
             C 205 140, 200 175, 215 195
             C 218 215, 200 226, 188 220
             C 175 213, 160 205, 158 188
             C 154 170, 162 158, 158 142
             C 152 128, 142 116, 144 100
             C 145 86, 148 75, 150 70 Z"
          fill="url(#irr-gradient)"
          stroke="var(--ink)"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />
        {/* East Malaysia approximation (Sabah + Sarawak) */}
        <path
          d="M 248 132
             C 270 128, 290 130, 312 138
             C 330 144, 338 158, 332 170
             C 322 178, 304 178, 290 174
             C 278 170, 268 168, 258 162
             C 250 154, 244 142, 248 132 Z"
          fill="url(#irr-gradient)"
          stroke="var(--ink)"
          strokeWidth="0.8"
          strokeOpacity="0.4"
        />

        {/* Lat/long crosshairs */}
        {[60, 100, 140, 180].map((y) => (
          <line
            key={y}
            x1="20"
            x2="340"
            y1={y}
            y2={y}
            stroke="var(--rule)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        ))}
        {[80, 160, 240, 320].map((x) => (
          <line
            key={x}
            x1={x}
            x2={x}
            y1="20"
            y2="220"
            stroke="var(--rule)"
            strokeWidth="0.5"
            strokeDasharray="2 4"
          />
        ))}

        {/* Site pins */}
        {sites.map((s, i) => (
          <g key={s.id} className="animate-riseIn" style={{ animationDelay: `${600 + i * 80}ms` }}>
            <circle cx={s.x} cy={s.y} r="6" fill="var(--leaf)" opacity="0.18" className="animate-pulseSoft" />
            <circle cx={s.x} cy={s.y} r="2.5" fill="var(--leaf-deep)" />
            <text
              x={s.x + 6}
              y={s.y + 3}
              fontSize="7.2"
              fontFamily="JetBrains Mono Variable, monospace"
              fill="var(--ink)"
            >
              {s.label}
            </text>
          </g>
        ))}

        {/* Equator label */}
        <text
          x="20"
          y="142"
          fontSize="8"
          fontFamily="JetBrains Mono Variable, monospace"
          fill="var(--mute)"
          letterSpacing="0.12em"
        >
          0° equator
        </text>
      </svg>

      <div className="flex items-center gap-3 mt-2 mono text-[9.5px] uppercase tracking-[0.16em] text-mute">
        <Legend color="var(--solar)" label="GHI 5.2+" />
        <Legend color="var(--leaf)" label="GHI 4.8" />
        <Legend color="var(--mint)" label="GHI 4.4 kWh/m²/d" />
      </div>
    </div>
  );
}

const Legend = ({ color, label }: { color: string; label: string }) => (
  <span className="inline-flex items-center gap-1">
    <span className="w-2.5 h-2.5 rounded-sm" style={{ background: color }} />
    {label}
  </span>
);
