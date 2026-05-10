import { fmtKWh, fmtRM } from "@/lib/format";
import MetricTile from "./MetricTile";
import HairlineRule from "@/components/chrome/HairlineRule";

export default function MetricStack({
  kwp,
  kwh,
  savings,
  payback,
  panels,
  capacityFactor,
}: {
  kwp: number;
  kwh: number;
  savings: number;
  payback: number;
  panels: number;
  capacityFactor: number;
}) {
  return (
    <div
      className="bg-surface rounded-2xl p-6 flex flex-col gap-5"
      style={{ border: "1px solid var(--rule)" }}
    >
      <div className="flex items-baseline justify-between">
        <h3 className="text-[13px] font-extrabold tracking-tight">Yield · live</h3>
        <span className="mono text-[10px] uppercase tracking-[0.16em] text-leaf-deep">
          ● solving
        </span>
      </div>

      <MetricTile
        label="Installed capacity"
        value={kwp}
        decimals={2}
        unit="kWp"
        accent="leaf"
        hint={`${panels} × 620 W modules`}
        variant="lg"
        delay={120}
      />
      <HairlineRule variant="dashed" />
      <MetricTile
        label="Annual yield"
        value={kwh}
        unit="kWh"
        accent="solar"
        hint={`Capacity factor ${(capacityFactor * 100).toFixed(1)}%`}
        variant="md"
        delay={240}
      />
      <HairlineRule variant="dashed" />
      <MetricTile
        label="Annual savings"
        value={savings}
        prefix="RM "
        accent="leaf"
        hint={`vs. ${fmtRM(savings * 1.42, { compact: true })} pre-PV bill`}
        variant="md"
        delay={360}
      />
      <HairlineRule variant="dashed" />
      <MetricTile
        label="Payback"
        value={payback}
        decimals={1}
        unit="years"
        accent="terracotta"
        hint="@ RM 4,500 / kWp · 25-yr ROI 480%"
        variant="md"
        delay={480}
      />

      <div
        className="mt-2 rounded-lg p-3 mono text-[10px] uppercase tracking-[0.16em] flex items-center gap-2"
        style={{ background: "var(--mint-tint)", color: "var(--ink-blue)" }}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-leaf animate-pulseSoft" />
        Solving with shading factors cached · {fmtKWh(Math.round(kwh / panels))} kWh / panel mean
      </div>
    </div>
  );
}
