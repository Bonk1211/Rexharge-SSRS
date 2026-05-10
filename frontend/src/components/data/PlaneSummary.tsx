import { Polygon } from "@/icons";
import { ParapetGlyph, RoofPitchGlyph } from "@/icons";

/* PlaneSummary — list of detected roof planes with their tilt, azimuth, area,
 * panel count. Headers in mono caps; values right-aligned tab-nums. */

export interface PlaneItem {
  id: string;
  name: string;
  tilt: number;
  azimuth: number;
  area: number;
  panels: number;
  status: "south-facing" | "west-facing" | "porch" | "north-facing";
}

const planes: PlaneItem[] = [
  { id: "P1", name: "South slope · main roof", tilt: 22, azimuth: 178, area: 56.2, panels: 28, status: "south-facing" },
  { id: "P2", name: "West slope · porch", tilt: 18, azimuth: 264, area: 18.4, panels: 10, status: "west-facing" },
];

const obstacles = [
  { id: "O1", name: "Water tank · 1.6 m", area: 1.54 },
];

const statusTone: Record<PlaneItem["status"], string> = {
  "south-facing": "var(--leaf-deep)",
  "west-facing": "var(--solar)",
  porch: "var(--ink-blue)",
  "north-facing": "var(--terracotta)",
};

export default function PlaneSummary() {
  return (
    <div className="bg-surface rounded-2xl p-5 flex flex-col gap-4" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-extrabold tracking-tight">Roof analysis</h3>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">RANSAC · α-shape</span>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <Polygon weight="duotone" size={13} className="text-leaf-deep" />
          <h4 className="mono text-[10px] uppercase tracking-[0.18em] text-mute">Detected planes</h4>
          <span className="ml-auto mono text-[10px] tab-num text-ink">{planes.length}</span>
        </div>
        <ul className="flex flex-col">
          {planes.map((p) => (
            <li
              key={p.id}
              className="grid grid-cols-[auto_1fr_auto] gap-3 py-2.5 border-t"
              style={{ borderColor: "var(--rule)" }}
            >
              <span
                className="mono text-[10px] uppercase tracking-[0.18em] tab-num self-center"
                style={{ color: statusTone[p.status] }}
              >
                {p.id}
              </span>
              <div>
                <p className="text-[12.5px] font-bold text-ink leading-tight">{p.name}</p>
                <p className="mono text-[10px] uppercase tracking-[0.14em] text-mute mt-0.5">
                  tilt {p.tilt}° · azim {p.azimuth}° · {p.area.toFixed(1)} m²
                </p>
              </div>
              <div className="text-right self-center">
                <p className="numeral tab-num text-[18px] leading-none" style={{ fontWeight: 600 }}>
                  {p.panels}
                </p>
                <p className="mono text-[9.5px] uppercase tracking-[0.16em] text-mute">panels</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-2">
          <ParapetGlyph size={13} className="text-terracotta" />
          <h4 className="mono text-[10px] uppercase tracking-[0.18em] text-mute">Obstacles</h4>
          <span className="ml-auto mono text-[10px] tab-num text-ink">{obstacles.length}</span>
        </div>
        <ul>
          {obstacles.map((o) => (
            <li
              key={o.id}
              className="grid grid-cols-[auto_1fr_auto] gap-3 py-2 border-t"
              style={{ borderColor: "var(--rule)" }}
            >
              <span
                className="mono text-[10px] uppercase tracking-[0.18em] tab-num self-center"
                style={{ color: "var(--terracotta)" }}
              >
                {o.id}
              </span>
              <p className="text-[12.5px] font-bold text-ink self-center leading-tight">{o.name}</p>
              <p className="mono text-[10px] tab-num text-mute self-center">{o.area.toFixed(2)} m²</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="flex items-center gap-3 mono text-[10px] uppercase tracking-[0.16em] text-mute pt-2 border-t" style={{ borderColor: "var(--rule)" }}>
        <RoofPitchGlyph size={13} className="text-ink-2" />
        <span>Building footprint <span className="text-ink tab-num normal-case tracking-tight">126 m²</span></span>
        <span className="text-dim">·</span>
        <span>Hip ridge <span className="text-ink tab-num normal-case tracking-tight">7.8 m</span></span>
      </section>
    </div>
  );
}
