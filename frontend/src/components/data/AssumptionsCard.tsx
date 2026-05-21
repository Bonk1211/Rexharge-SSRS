import { CheckCircle, Sparkle } from "@/icons";

/* AssumptionsCard — Malaysia-grounded constants used in this simulation.
 * Cite-and-display pattern. Each row a hairline-separated key-value. */

const items: Array<{ k: string; v: string; src?: string }> = [
  { k: "Irradiance source", v: "PVGIS TMY", src: "EU JRC" },
  { k: "Cell temperature", v: "50 °C", src: "Malaysia roof empirical" },
  { k: "Temp coefficient", v: "−0.29 % / °C", src: "Trina Vertex N spec" },
  { k: "Soiling", v: "2 – 5 %", src: "tilt-dependent" },
  { k: "Wiring · mismatch", v: "2 % · 2 %", src: "Standard EPC" },
  { k: "Inverter loss", v: "1.4 %", src: "Sigen 98.6%" },
  { k: "ATAP NEM 3.0", v: "RM 0.30 / kWh", src: "SMP proxy" },
  { k: "CAPEX", v: "RM 4,500 / kWp", src: "configurable" },
];

export default function AssumptionsCard() {
  return (
    <div className="bg-surface rounded-2xl p-5" style={{ border: "1px solid var(--rule)" }}>
      <div className="flex items-baseline justify-between mb-3">
        <h3 className="text-[13px] font-extrabold tracking-tight">Engineering assumptions</h3>
        <Sparkle weight="duotone" size={13} className="text-leaf-deep" />
      </div>
      <ul className="grid grid-cols-1 gap-0">
        {items.map((it, i) => (
          <li
            key={i}
            className="grid grid-cols-[auto_1fr_auto] items-baseline gap-3 py-2"
            style={{ borderBottom: i === items.length - 1 ? "none" : "1px dashed var(--rule)" }}
          >
            <CheckCircle weight="fill" size={11} className="text-leaf" />
            <div>
              <span className="text-[12.5px] font-bold text-ink">{it.k}</span>
              {it.src && (
                <span className="ml-2 mono text-[9.5px] uppercase tracking-[0.16em] text-mute">
                  {it.src}
                </span>
              )}
            </div>
            <span className="mono tab-num text-[12px] text-ink">{it.v}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
