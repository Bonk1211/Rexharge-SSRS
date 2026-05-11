import { toast } from "sonner";
import { CaretDown } from "@/icons";

/* Panel schedule — first-12-of-N table of generated panels.
 * Mono table with tab-nums, hairline separators between rows. */

interface Row {
  id: string;
  plane: string;
  tilt: number;
  azim: number;
  shade: number;
}

const rows: Row[] = Array.from({ length: 12 }).map((_, i) => ({
  id: `M-${(i + 1).toString().padStart(3, "0")}`,
  plane: i < 8 ? "P1" : "P2",
  tilt: i < 8 ? 22 : 18,
  azim: i < 8 ? 178 : 264,
  shade: 0.94 + (i % 4) * 0.015 - (i === 6 || i === 7 ? 0.18 : 0),
}));

export default function PanelSchedule() {
  return (
    <div className="bg-surface rounded-2xl overflow-hidden" style={{ border: "1px solid var(--rule)" }}>
      <header className="flex items-baseline justify-between px-5 pt-5 pb-3">
        <h3 className="text-[13px] font-extrabold tracking-tight">Panel schedule</h3>
        <button onClick={() => toast("Coming soon")} className="mono text-[10px] uppercase tracking-[0.16em] text-mute hover:text-ink flex items-center gap-1">
          showing 12 of 38 <CaretDown weight="bold" size={10} />
        </button>
      </header>
      <table className="w-full mono text-[11px] tab-num">
        <thead>
          <tr
            className="text-[9.5px] uppercase tracking-[0.18em] text-mute text-left"
            style={{ borderTop: "1px solid var(--rule)", borderBottom: "1px solid var(--rule)" }}
          >
            <th className="px-5 py-2 font-normal">ID</th>
            <th className="px-3 py-2 font-normal">Plane</th>
            <th className="px-3 py-2 font-normal text-right">Tilt</th>
            <th className="px-3 py-2 font-normal text-right">Azim</th>
            <th className="px-3 py-2 font-normal text-right">Shade</th>
            <th className="px-5 py-2 font-normal text-right">kWh / yr</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id}
              className="text-ink-2"
              style={{ borderBottom: i === rows.length - 1 ? "none" : "1px dashed var(--rule)" }}
            >
              <td className="px-5 py-2 text-leaf-deep">{r.id}</td>
              <td className="px-3 py-2">{r.plane}</td>
              <td className="px-3 py-2 text-right">{r.tilt}°</td>
              <td className="px-3 py-2 text-right">{r.azim}°</td>
              <td className="px-3 py-2 text-right">
                <span style={{ color: r.shade < 0.85 ? "var(--terracotta)" : "var(--leaf-deep)" }}>
                  {r.shade.toFixed(3)}
                </span>
              </td>
              <td className="px-5 py-2 text-right text-ink">
                {Math.round(820 * r.shade).toLocaleString("en-MY")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
