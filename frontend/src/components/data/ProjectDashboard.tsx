import MetricTile from "@/components/metrics/MetricTile";
import HairlineRule from "@/components/chrome/HairlineRule";
import { SIM_CONSTANTS } from "@/lib/sim-constants";
import type { Project } from "@/data/mock-projects";

const C = SIM_CONSTANTS;

interface Props {
  project: Project;
}

export default function ProjectDashboard({ project }: Props) {
  const m = derive(project);

  return (
    <div className="flex flex-col gap-10">
      <Group title="System Summary">
        <Tile label="Total Panels" value={project.panels} />
        <Tile label="System Capacity" value={project.kwp} unit="kWp" decimals={1} accent="leaf" />
        <Tile label="Coverage" value={project.roofCoveragePercent} unit="%" decimals={0} />
        <Tile label="Annual Yield" value={m.annualMwh} unit="MWh" decimals={1} accent="solar" />
      </Group>

      <Group title="Real-Time Output">
        <Tile label="Instant Power" value={m.instantPowerKw} unit="kW" decimals={2} accent="solar" />
        <Tile label="Cell Temp" value={C.cellTempC} unit="°C" />
        <Tile label="Panel Efficiency" value={C.panelEfficiency * 100} unit="%" decimals={0} />
        <Tile label="Temp Derate" value={m.tempDeratePct} unit="%" decimals={1} />
        <Tile label="DC Output (per panel)" value={m.dcPerPanelW} unit="W" decimals={0} />
        <Tile label="AC Output (system)" value={m.instantPowerKw} unit="kW" decimals={2} />
        <Tile label="Cloud Cover" value={project.cloudCoverPercent} unit="%" decimals={0} />
        <Tile label="Irradiance Factor" value={m.irradianceFactor} decimals={2} hint="G/1000" />
      </Group>

      <Group title="Energy Production">
        <Tile label="Daily Avg" value={m.dailyAvgKwh} unit="kWh" decimals={0} />
        <Tile label="Monthly Avg" value={m.monthlyAvgKwh} unit="kWh" decimals={0} />
        <Tile label="Annual Total" value={m.annualMwh} unit="MWh" decimals={1} />
        <Tile label="Specific Yield" value={m.specificYield} unit="kWh/kWp" decimals={0} />
      </Group>

      <Group title="Environmental Factors" cols={6}>
        <Tile label="☀ Solar Irradiance" value={project.irradianceWm2} unit="W/m²" decimals={0} accent="solar" />
        <Tile label="🌡 Temperature" value={project.ambientTempC} unit="°C" decimals={0} />
        <Tile label="🌀 Wind Speed" value={project.windSpeedMs} unit="m/s" decimals={1} />
        <Tile label="💧 Humidity" value={project.humidityPercent} unit="%" decimals={0} />
        <Tile label="☁ Dust Loss" value={C.soilingLossPct} unit="%" decimals={0} />
        <Tile label="☼ Sun Elevation" value={null} unit="°" />
      </Group>

      <Group title="Loss Analysis" cols={6}>
        <Tile label="Temperature Loss" value={m.tempLossAbsPct} unit="%" decimals={1} />
        <Tile label="Dust / Soiling" value={C.soilingLossPct} unit="%" decimals={0} />
        <Tile label="Inverter Loss" value={C.inverterLossPct} unit="%" decimals={1} />
        <Tile label="Wiring Loss" value={C.wiringLossPct} unit="%" decimals={0} />
        <Tile label="Shading Loss" value={project.shadingLossPercent} unit="%" decimals={1} />
        <Tile label="Performance Ratio" value={m.performanceRatioPct} unit="%" decimals={1} accent="leaf" />
      </Group>

      <Group title="Inverter Configuration">
        <TextTile label="Model" value={project.inverterModelSku ?? C.inverterModelSku} />
        <Tile label="Inverters Needed" value={m.invertersNeeded} decimals={0} />
        <Tile label="Total AC Capacity" value={m.totalAcCapacityKw} unit="kW" decimals={0} />
        <Tile label="DC/AC Ratio" value={m.dcAcRatio} decimals={2} />
      </Group>

      <FinancialBlock project={project} m={m} />
    </div>
  );
}

function Group({
  title,
  cols = 4,
  children,
}: {
  title: string;
  cols?: 2 | 4 | 6;
  children: React.ReactNode;
}) {
  const gridClass =
    cols === 6
      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5"
      : cols === 2
        ? "grid grid-cols-1 sm:grid-cols-2 gap-5"
        : "grid grid-cols-2 lg:grid-cols-4 gap-5";

  return (
    <section>
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="mono text-[11px] uppercase tracking-[0.22em] text-leaf-deep">{title}</h3>
        <HairlineRule className="flex-1" />
      </div>
      <div className={gridClass}>{children}</div>
    </section>
  );
}

function Tile({
  label,
  value,
  unit,
  decimals = 0,
  hint,
  accent,
}: {
  label: string;
  value: number | null | undefined;
  unit?: string;
  decimals?: number;
  hint?: string;
  accent?: "leaf" | "solar" | "terracotta" | "ink-blue";
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return <PlaceholderTile label={label} unit={unit} />;
  }
  return (
    <MetricTile
      label={label}
      value={value}
      unit={unit}
      decimals={decimals}
      hint={hint}
      variant="sm"
      accent={accent}
    />
  );
}

function TextTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">{label}</span>
      <span className="numeral text-[20px] leading-none text-ink" style={{ fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}

function PlaceholderTile({ label, unit }: { label: string; unit?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="mono text-[9.5px] uppercase tracking-[0.18em] text-mute">{label}</span>
      <div className="flex items-baseline gap-1.5">
        <span className="numeral text-[26px] leading-none text-dim tab-num">--</span>
        {unit && (
          <span className="mono text-[11px] uppercase tracking-[0.16em] text-dim pb-1">{unit}</span>
        )}
      </div>
    </div>
  );
}

function FinancialBlock({ project, m }: { project: Project; m: Derived }) {
  return (
    <section>
      <div className="mb-3 flex items-baseline gap-3">
        <h3 className="mono text-[11px] uppercase tracking-[0.22em] text-leaf-deep">
          Financial Estimate (TNB)
        </h3>
        <HairlineRule className="flex-1" />
      </div>

      <div
        className="rounded-2xl bg-surface p-5"
        style={{ border: "1px solid var(--rule)" }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          <Field label="Tariff Type">
            <div
              className="h-10 rounded-lg px-3 flex items-center text-[13px] text-ink"
              style={{ border: "1px solid var(--rule)", background: "var(--surface-2)" }}
            >
              {project.tariffType ?? "—"}
            </div>
          </Field>
          <Field label="Monthly Usage">
            <div className="flex items-center gap-2">
              <div
                className="h-10 rounded-lg px-3 flex items-center text-[13px] tab-num text-ink min-w-[140px]"
                style={{ border: "1px solid var(--rule)", background: "var(--surface-2)" }}
              >
                {project.monthlyUsageKwh ?? "—"}
              </div>
              <span className="mono text-[10.5px] uppercase tracking-[0.18em] text-mute">kWh</span>
            </div>
          </Field>
          <Field label="NEM Sellback">
            <span
              className="inline-flex h-8 items-center gap-2 rounded-full px-3 mono text-[10.5px] uppercase tracking-[0.18em] w-fit"
              style={{
                background: project.nemSellbackEnabled ? "var(--leaf-tint)" : "var(--surface-2)",
                color: project.nemSellbackEnabled ? "var(--leaf-deep)" : "var(--mute)",
                border: "1px solid var(--rule)",
              }}
            >
              {project.nemSellbackEnabled ? "On" : "Off"}
            </span>
          </Field>
          <Field label="TNB Effective Rate">
            <NumericLine value={C.tariffRmPerKwh} prefix="RM " unit="/kWh" decimals={2} />
          </Field>
          <Field label="Monthly Savings">
            <NumericLine value={m.monthlySavingsRm} prefix="RM " decimals={0} />
          </Field>
          <Field label="Annual Savings">
            <NumericLine value={project.annualSavingsRm || null} prefix="RM " decimals={0} />
          </Field>
          <Field label="System Cost (est.)">
            <NumericLine value={m.systemCostRm} prefix="RM " decimals={0} />
          </Field>
          <Field label="Payback Period">
            <NumericLine value={project.paybackYears || null} unit="yrs" decimals={1} />
          </Field>
          <Field label="CO₂ Offset">
            <NumericLine value={m.co2OffsetT} unit="tonnes/yr" decimals={1} />
          </Field>
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-mute">{label}</span>
      {children}
    </div>
  );
}

function NumericLine({
  value,
  prefix,
  unit,
  decimals = 0,
}: {
  value: number | null | undefined;
  prefix?: string;
  unit?: string;
  decimals?: number;
}) {
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return (
      <div className="flex items-baseline gap-1.5">
        <span className="numeral text-[22px] leading-none text-dim tab-num">--</span>
        {unit && (
          <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-dim">{unit}</span>
        )}
      </div>
    );
  }
  const formatted = value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="numeral text-[22px] leading-none text-ink tab-num" style={{ fontWeight: 600 }}>
        {prefix}
        {formatted}
      </span>
      {unit && (
        <span className="mono text-[10.5px] uppercase tracking-[0.16em] text-mute">{unit}</span>
      )}
    </div>
  );
}

interface Derived {
  annualMwh: number;
  instantPowerKw: number | null;
  tempDeratePct: number;
  dcPerPanelW: number | null;
  irradianceFactor: number | null;
  dailyAvgKwh: number;
  monthlyAvgKwh: number;
  specificYield: number | null;
  tempLossAbsPct: number;
  performanceRatioPct: number;
  invertersNeeded: number;
  totalAcCapacityKw: number;
  dcAcRatio: number | null;
  monthlySavingsRm: number | null;
  systemCostRm: number;
  co2OffsetT: number;
}

function derive(p: Project): Derived {
  const tempDelta = C.cellTempC - 25;
  const tempDeratePct = C.tempCoeffPctPerC * tempDelta;
  const tempLossAbsPct = Math.abs(tempDeratePct);

  const irradianceFactor = p.irradianceWm2 != null ? p.irradianceWm2 / 1000 : null;
  const instantPowerKw =
    irradianceFactor != null
      ? p.kwp *
        irradianceFactor *
        C.panelEfficiency *
        (1 + (C.tempCoeffPctPerC * tempDelta) / 100) *
        (1 - C.inverterLossPct / 100)
      : null;
  const dcPerPanelW = instantPowerKw != null && p.panels > 0 ? (instantPowerKw * 1000) / p.panels : null;

  const annualMwh = p.annualKwh / 1000;
  const dailyAvgKwh = p.annualKwh / 365;
  const monthlyAvgKwh = p.annualKwh / 12;
  const specificYield = p.kwp > 0 ? p.annualKwh / p.kwp : null;

  const shading = p.shadingLossPercent ?? 0;
  const performanceRatioPct =
    100 - (tempLossAbsPct + C.soilingLossPct + C.inverterLossPct + C.wiringLossPct + shading);

  const invUnit = p.inverterUnitCapacityKw ?? C.inverterUnitCapacityKw;
  const invertersNeeded = p.kwp > 0 ? Math.ceil(p.kwp / invUnit) : 0;
  const totalAcCapacityKw = invertersNeeded * invUnit;
  const dcAcRatio = totalAcCapacityKw > 0 ? p.kwp / totalAcCapacityKw : null;

  const monthlySavingsRm = p.annualSavingsRm > 0 ? p.annualSavingsRm / 12 : null;
  const systemCostRm = p.kwp * C.capexRmPerKwp;
  const co2OffsetT = (p.annualKwh * C.co2KgPerKwh) / 1000;

  return {
    annualMwh,
    instantPowerKw,
    tempDeratePct,
    dcPerPanelW,
    irradianceFactor,
    dailyAvgKwh,
    monthlyAvgKwh,
    specificYield,
    tempLossAbsPct,
    performanceRatioPct,
    invertersNeeded,
    totalAcCapacityKw,
    dcAcRatio,
    monthlySavingsRm,
    systemCostRm,
    co2OffsetT,
  };
}
