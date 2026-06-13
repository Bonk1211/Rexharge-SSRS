import {
  CASE_STUDY_BUILDINGS,
  type CaseStudyBuilding,
} from "./case-study-buildings";
import { extractMetricsFromReport } from "./project-reports";
import ecoHorizonReport from "./reports/eco_horizon.json";
import ssuUmReport from "./reports/ssu_um.json";
import householdReport from "./reports/household.json";
import starGrocerReport from "./reports/star_grocer.json";
import rainbowReport from "./reports/rainbow.json";

const REPORTS_BY_ID: Record<string, unknown> = {
  "eco-horizon": ecoHorizonReport,
  "ssu-um": ssuUmReport,
  "household": householdReport,
  "star-grocer": starGrocerReport,
  "rainbow": rainbowReport,
};

export type ProjectStatus = "ready" | "processing" | "draft" | "failed";
export type IntakeMode = "drone_video" | "photos" | "demo";

export interface Project {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  intakeMode: IntakeMode;
  status: ProjectStatus;
  capturedAt: string;
  thumbnailHue: number;
  kwp: number;
  annualKwh: number;
  annualSavingsRm: number;
  paybackYears: number;
  monthlyKwh: number[];
  panels: number;
  planes: number;
  obstacles: number;
  capacityFactor: number;
  reportId?: string | null;
  modelGlbPath?: string | null;
  measurementImgPath?: string | null;
  dataJsonPath?: string | null;
  thumbnailUrl?: string | null;
  irradianceWm2?: number;
  ambientTempC?: number;
  windSpeedMs?: number;
  humidityPercent?: number;
  cloudCoverPercent?: number;
  roofCoveragePercent?: number;
  shadingLossPercent?: number;
  inverterModelSku?: string;
  inverterUnitCapacityKw?: number;
  monthlyUsageKwh?: number;
  nemSellbackEnabled?: boolean;
  tariffType?: string;
}

const CAPTURED_AT = "2026-05-22T10:00:00+08:00";

const MONTHLY_SHAPE = [
  0.0855, 0.0844, 0.0867, 0.0850, 0.0841, 0.0827,
  0.0832, 0.0838, 0.0835, 0.0825, 0.0796, 0.0790,
];

function monthly(annual: number): number[] {
  if (!annual) return [];
  return MONTHLY_SHAPE.map((f) => Math.round(annual * f));
}

function makeProject(b: CaseStudyBuilding): Project {
  const report = REPORTS_BY_ID[b.reportId];
  const m = extractMetricsFromReport(report);
  return {
    id: b.uuid,
    name: b.name,
    address: b.address,
    lat: b.lat,
    lon: b.lon,
    intakeMode: b.intakeMode ?? "drone_video",
    status: b.status ?? "ready",
    capturedAt: CAPTURED_AT,
    thumbnailHue: b.thumbnailHue,
    kwp: m?.kwp ?? 0,
    annualKwh: m?.annualKwh ?? 0,
    annualSavingsRm: m?.annualSavingsRm ?? 0,
    paybackYears: m?.paybackYears ?? 0,
    monthlyKwh: m?.annualKwh ? monthly(m.annualKwh) : [],
    panels: m?.panels ?? 0,
    planes: 0,
    obstacles: 0,
    capacityFactor: m?.capacityFactor ?? 0,
    reportId: b.reportId,
    modelGlbPath: b.modelGlbUrl,
    measurementImgPath: b.measurementImgUrl,
    thumbnailUrl: b.thumbnailUrl,
    monthlyUsageKwh: b.monthlyUsageKwh,
    tariffType: b.tariffCode,
  };
}

export const PROJECTS: Project[] = CASE_STUDY_BUILDINGS.map(makeProject);
