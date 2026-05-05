import { ArrowsClockwise, CheckCircle, Sparkle, Warning } from "@/icons";

/* Activity feed — recent pipeline events. Stub data, designed to look real.
 * Hairline timeline with mono timestamps. */

type Kind = "ready" | "processing" | "failed" | "atap";

const items: Array<{ time: string; site: string; kind: Kind; note: string }> = [
  { time: "13:02", site: "Shah Alam — Triple Shoplot", kind: "processing", note: "Meshroom — depth densification step 4 of 7" },
  { time: "12:48", site: "Petaling Jaya — Light-industrial", kind: "ready", note: "Layout solved · 84 panels · 52.08 kWp" },
  { time: "11:22", site: "Ipoh — Heritage Bungalow", kind: "ready", note: "PVGIS TMY cached for 4.5975, 101.0901" },
  { time: "10:14", site: "Cyberjaya — Office Block", kind: "atap", note: "ATAP NEM 3.0 export rate updated to RM 0.30 / kWh" },
  { time: "09:40", site: "Penang — Surau Pilot", kind: "failed", note: "DJI Terra OBJ — texture missing, retry recommended" },
];

const config: Record<Kind, { Icon: typeof CheckCircle; color: string; bg: string }> = {
  ready: { Icon: CheckCircle, color: "var(--leaf-deep)", bg: "var(--leaf-tint)" },
  processing: { Icon: ArrowsClockwise, color: "var(--ink-blue)", bg: "var(--mint-tint)" },
  failed: { Icon: Warning, color: "var(--crimson)", bg: "color-mix(in srgb, var(--terracotta) 14%, transparent)" },
  atap: { Icon: Sparkle, color: "var(--leaf-deep)", bg: "var(--leaf-tint)" },
};

export default function ActivityFeed() {
  return (
    <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-extrabold tracking-tight">Pipeline activity</h3>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-mute">Today · KL Time</span>
      </div>

      <ol className="relative">
        <span
          aria-hidden
          className="absolute left-[15px] top-2 bottom-2 w-px"
          style={{
            background:
              "repeating-linear-gradient(to bottom, var(--rule) 0, var(--rule) 3px, transparent 3px, transparent 7px)",
          }}
        />
        {items.map((it, i) => {
          const c = config[it.kind];
          return (
            <li key={i} className="relative pl-9 pb-4 last:pb-0">
              <span
                className="absolute left-0 top-0 w-[30px] h-[30px] rounded-full flex items-center justify-center"
                style={{ background: c.bg, border: `1px solid color-mix(in srgb, ${c.color} 30%, transparent)` }}
              >
                <c.Icon weight={it.kind === "processing" ? "bold" : "fill"} size={13} style={{ color: c.color }} />
              </span>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[12.5px] font-bold text-ink">{it.site}</span>
                <span className="mono text-[10px] text-mute tab-num">{it.time}</span>
              </div>
              <p className="text-[12px] text-mute leading-relaxed">{it.note}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
