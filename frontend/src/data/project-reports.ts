import type ecoHorizonReport from "./reports/eco_horizon.json";
import type ssuUmReport from "./reports/ssu_um.json";

export type ProjectReportId =
  | "eco-horizon"
  | "ssu-um"
  | "household"
  | "star-grocer"
  | "rainbow"
  | "kk257";

export type FullProjectReport = typeof ecoHorizonReport | typeof ssuUmReport;
type PlaceholderReport = { _placeholder: true; [key: string]: unknown };
export type ProjectReport = FullProjectReport | PlaceholderReport;

export function isPlaceholderReport(r: ProjectReport | null): r is PlaceholderReport {
  return !!r && (r as { _placeholder?: boolean })._placeholder === true;
}

const projectReportLoaders: Record<ProjectReportId, () => Promise<ProjectReport>> = {
  "eco-horizon": () => import("./reports/eco_horizon.json").then((m) => m.default),
  "ssu-um":      () => import("./reports/ssu_um.json").then((m) => m.default),
  "household":   () => import("./reports/household.json").then((m) => m.default as ProjectReport),
  "star-grocer": () => import("./reports/star_grocer.json").then((m) => m.default as ProjectReport),
  "rainbow":     () => import("./reports/rainbow.json").then((m) => m.default as ProjectReport),
  "kk257":       () => import("./reports/kk257.json").then((m) => m.default as ProjectReport),
};

export function hasProjectReport(reportId?: string): reportId is ProjectReportId {
  return Boolean(reportId && reportId in projectReportLoaders);
}

export async function loadProjectReport(reportId?: string) {
  if (!reportId) return null;
  if (!hasProjectReport(reportId)) return null;
  return projectReportLoaders[reportId]();
}

export type ReportMetrics = {
  kwp: number;
  annualKwh: number;
  annualSavingsRm: number;
  paybackYears: number;
  panels: number;
  capacityFactor: number;
  panelWatts: number;
};

const num = (s: unknown): number => {
  if (typeof s === "number") return s;
  if (typeof s !== "string") return 0;
  const m = s.replace(/[,\s]/g, "").match(/-?\d+(\.\d+)?/);
  return m ? parseFloat(m[0]) : 0;
};

export function extractMetricsFromReport(report: unknown): ReportMetrics | null {
  if (!report || typeof report !== "object") return null;
  const r = report as Record<string, any>;
  const sys = r.systemSummary ?? {};
  const energy = r.energyProduction ?? {};
  const fin = r.financial ?? {};
  const panelSpecs = r.panelConfig?.specs ?? {};

  const kwp = num(sys.systemCapacity);
  if (!kwp) return null;

  let annualKwh = num(energy.annualTotal);
  if (/MWh/i.test(String(energy.annualTotal ?? ""))) annualKwh *= 1000;

  const specificYield = num(energy.specificYield);
  const capacityFactor = specificYield ? specificYield / 8760 : 0;

  return {
    kwp,
    annualKwh,
    annualSavingsRm: num(fin.annualSavings),
    paybackYears: num(fin.paybackPeriod),
    panels: num(sys.totalPanels),
    capacityFactor,
    panelWatts: num(panelSpecs.power_stc) || 620,
  };
}
