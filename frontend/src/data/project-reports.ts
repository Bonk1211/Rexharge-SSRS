import type ecoHorizonReport from "./reports/eco_horizon.json";
import type ssuUmReport from "./reports/ssu_um.json";

export type ProjectReportId =
  | "eco-horizon"
  | "ssu-um"
  | "household"
  | "star-grocer"
  | "rainbow";

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
};

export function hasProjectReport(reportId?: string): reportId is ProjectReportId {
  return Boolean(reportId && reportId in projectReportLoaders);
}

export async function loadProjectReport(reportId?: string) {
  if (!reportId) return null;
  if (!hasProjectReport(reportId)) return null;
  return projectReportLoaders[reportId]();
}
