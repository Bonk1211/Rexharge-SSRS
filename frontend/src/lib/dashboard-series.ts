import type { Project } from "@/data/projects";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

const ETA = 0.97;
const SOILING = 0.96;
const DERATE = 0.95;

function sunInstantPowerKw(t: number, kwp: number): number {
  const ang = t * Math.PI;
  const elev = Math.sin(ang);
  if (elev <= 0) return 0;
  const ghi = 1080 * Math.pow(elev, 1.05);
  const poa = ghi * (0.92 + 0.16 * Math.sin(ang - 0.3));
  const tAmb = 27 + 7 * Math.pow(elev, 0.8);
  const tCell = tAmb + (poa / 1000) * 25;
  const tempDerate = 1 - 0.0035 * (tCell - 25);
  return (poa / 1000) * kwp * ETA * SOILING * tempDerate * DERATE;
}

export interface HourPoint {
  hour: number;
  kw: number;
}

export function buildHourlyPowerCurve(projects: Project[]): HourPoint[] {
  const ready = projects.filter((p) => p.status === "ready");
  const totalKwp = ready.reduce((s, p) => s + p.kwp, 0);
  return Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    kw: sunInstantPowerKw(h / 24, totalKwp),
  }));
}

export interface MonthPoint {
  month: string;
  actual: number;
  gap: number;
}

export function buildMonthlyYieldVsTarget(projects: Project[]): MonthPoint[] {
  const ready = projects.filter((p) => p.status === "ready");
  const monthly = MONTH_LABELS.map((_, i) =>
    ready.reduce((s, p) => s + (p.monthlyKwh?.[i] ?? 0), 0),
  );
  const annual = monthly.reduce((s, v) => s + v, 0);
  const target = (annual / 12) * 1.05;
  return MONTH_LABELS.map((month, i) => ({
    month,
    actual: Math.round(monthly[i]),
    gap: Math.max(0, Math.round(target - monthly[i])),
  }));
}

export interface GaugeValues {
  pr: number;
  soiling: number;
  capacityFactor: number;
}

export function buildGaugeValues(projects: Project[]): GaugeValues {
  const ready = projects.filter((p) => p.status === "ready");
  const cf = ready.length
    ? ready.reduce((s, p) => s + (p.capacityFactor ?? 0), 0) / ready.length
    : 0;
  return {
    pr: 0.94,
    soiling: SOILING,
    capacityFactor: cf,
  };
}
