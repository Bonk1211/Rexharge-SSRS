import type ecoHorizonReport from "./reports/eco_horizon.json";
import type ssuUmReport from "./reports/ssu_um.json";

export type ProjectReportId = "eco-horizon" | "ssu-um";
export type ProjectReport = typeof ecoHorizonReport | typeof ssuUmReport;

const projectReportLoaders: Record<ProjectReportId, () => Promise<ProjectReport>> = {
  "eco-horizon": () => import("./reports/eco_horizon.json").then((module) => module.default),
  "ssu-um": () => import("./reports/ssu_um.json").then((module) => module.default),
};

export function hasProjectReport(reportId?: string): reportId is ProjectReportId {
  return Boolean(reportId && reportId in projectReportLoaders);
}

export async function loadProjectReport(reportId?: string) {
  if (!reportId) return null;
  if (!hasProjectReport(reportId)) return null;
  return projectReportLoaders[reportId]();
}
